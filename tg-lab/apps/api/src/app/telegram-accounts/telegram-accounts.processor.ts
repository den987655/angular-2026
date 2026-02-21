import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import {
  TELEGRAM_JOB_REQUEST_CODE,
  TELEGRAM_JOB_VERIFY_CODE,
  TELEGRAM_QUEUE_NAME,
} from '../telegram-queue/telegram-queue.constants';
import { AuthUser } from './telegram-accounts.service';
import { TelegramAccountsStore } from './telegram-accounts.store';

type RequestCodeJobData = {
  phone: string;
  user: AuthUser;
};

type VerifyJobData = {
  phone: string;
  code: string;
  user: AuthUser;
};

type PendingAuth = {
  phoneCodeHash: string;
  client: TelegramClient;
  session: StringSession;
  ownerId: string;
};

@Processor(TELEGRAM_QUEUE_NAME)
export class TelegramAccountsProcessor extends WorkerHost {
  private readonly logger = new Logger(TelegramAccountsProcessor.name);
  private readonly pendingAuthByPhone = new Map<string, PendingAuth>();

  constructor(private readonly telegramAccountsStore: TelegramAccountsStore) {
    super();
  }

  // Architectural note:
  // External Telegram side effects live only in processor (worker layer),
  // so retries/failures are isolated from HTTP request lifecycle.
  async process(job: Job<RequestCodeJobData | VerifyJobData>) {
    try {
      if (job.name === TELEGRAM_JOB_REQUEST_CODE) {
        return this.handleRequestCode(job.data as RequestCodeJobData, job);
      }

      if (job.name === TELEGRAM_JOB_VERIFY_CODE) {
        return this.handleVerifyCode(job.data as VerifyJobData, job);
      }

      this.logger.warn(
        JSON.stringify({
          event: 'telegram_unknown_job',
          jobName: job.name,
          jobId: job.id,
        })
      );
      return null;
    } catch (error: any) {
      // Proper error handling:
      // 1) Log structured details for observability.
      // 2) Re-throw so BullMQ marks job as failed and applies retry policy.
      this.logger.error(
        JSON.stringify({
          event: 'telegram_job_error',
          jobName: job.name,
          jobId: job.id,
          message: error?.message ?? 'unknown error',
        }),
        error?.stack
      );
      throw error;
    }
  }

  private async handleRequestCode(data: RequestCodeJobData, job: Job) {
    const { normalizedPhone, owner, decryptedSessionString } =
      await this.telegramAccountsStore.findByPhoneForUser(data.phone, data.user);
    const { client, session } = this.createTelegramClient(decryptedSessionString);

    try {
      await client.connect();
      const sentCode: any = await client.sendCode(
        { apiId: this.getApiId(), apiHash: this.getApiHash() },
        normalizedPhone
      );

      const sentCodeJson =
        typeof sentCode?.toJSON === 'function' ? sentCode.toJSON() : null;
      const sentCodeKeys = sentCode ? Object.keys(sentCode) : [];
      const typeKeys = sentCode?.type ? Object.keys(sentCode.type) : [];
      const nextTypeKeys = sentCode?.nextType ? Object.keys(sentCode.nextType) : [];

      this.logger.log(
        JSON.stringify({
          event: 'telegram_request_code_type',
          jobId: job.id,
          userId: data.user.id,
          phone: normalizedPhone,
          codeType: sentCode?.type?._ ?? sentCode?.type?.className ?? sentCode?.type,
          nextType: sentCode?.nextType?._ ?? sentCode?.nextType?.className ?? sentCode?.nextType,
          timeout: sentCode?.timeout ?? null,
          raw: sentCodeJson,
          rawType: sentCode?.constructor?.name ?? null,
          sentCodeKeys,
          typeKeys,
          nextTypeKeys,
        })
      );

      const phoneCodeHash = sentCode?.phoneCodeHash;
      if (!phoneCodeHash) {
        throw new InternalServerErrorException('Telegram не вернул phoneCodeHash');
      }

      this.pendingAuthByPhone.set(normalizedPhone, {
        phoneCodeHash,
        client,
        session,
        ownerId: owner.id,
      });

      await this.telegramAccountsStore.markPending(data.user, normalizedPhone);

      this.logger.log(
        JSON.stringify({
          event: 'telegram_request_code_sent',
          jobId: job.id,
          userId: data.user.id,
          phone: normalizedPhone,
        })
      );

      return { message: 'Код отправлен в Telegram' };
    } catch (error: any) {
      await client.disconnect().catch(() => undefined);
      throw new BadRequestException(
        error?.message ?? 'Не удалось отправить код Telegram'
      );
    }
  }

  private async handleVerifyCode(data: VerifyJobData, job: Job) {
    const { normalizedPhone, owner } = await this.telegramAccountsStore.findByPhoneForUser(
      data.phone,
      data.user
    );
    const pending = this.pendingAuthByPhone.get(normalizedPhone);

    if (!pending || pending.ownerId !== owner.id) {
      throw new BadRequestException(
        'Код не запрошен. Сначала вызовите request-code'
      );
    }

    try {
      await pending.client.invoke(
        new Api.auth.SignIn({
          phoneNumber: normalizedPhone,
          phoneCodeHash: pending.phoneCodeHash,
          phoneCode: data.code.trim(),
        })
      );

      const sessionString = pending.session.save() || null;
      await this.telegramAccountsStore.markActiveWithSession(
        data.user,
        normalizedPhone,
        sessionString
      );

      this.logger.log(
        JSON.stringify({
          event: 'telegram_verify_success',
          jobId: job.id,
          userId: data.user.id,
          phone: normalizedPhone,
        })
      );

      return { message: 'Аккаунт подтвержден' };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message ?? 'Не удалось подтвердить код'
      );
    } finally {
      await pending.client.disconnect().catch(() => undefined);
      this.pendingAuthByPhone.delete(normalizedPhone);
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, error: Error) {
    this.logger.error(
      JSON.stringify({
        event: 'telegram_job_failed',
        jobName: job?.name ?? 'unknown',
        jobId: job?.id ?? 'unknown',
        message: error.message,
      }),
      error.stack
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(
      JSON.stringify({
        event: 'telegram_job_completed',
        jobName: job.name,
        jobId: job.id,
      })
    );
  }

  private createTelegramClient(decryptedSessionString: string | null = null) {
    const session = new StringSession(decryptedSessionString || '');
    const client = new TelegramClient(
      session,
      this.getApiId(),
      this.getApiHash(),
      { connectionRetries: 3 }
    );
    return { client, session };
  }

  private getApiId() {
    const apiId = Number(process.env.TELEGRAM_API_ID || 0);
    if (!apiId) {
      throw new BadRequestException('TELEGRAM_API_ID не задан. Добавьте в .env');
    }
    return apiId;
  }

  private getApiHash() {
    const apiHash = process.env.TELEGRAM_API_HASH || '';
    if (!apiHash) {
      throw new BadRequestException(
        'TELEGRAM_API_HASH не задан. Добавьте в .env'
      );
    }
    return apiHash;
  }
}
