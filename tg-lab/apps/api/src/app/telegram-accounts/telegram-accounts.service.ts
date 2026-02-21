import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  TELEGRAM_JOB_REQUEST_CODE,
  TELEGRAM_JOB_VERIFY_CODE,
  TELEGRAM_QUEUE_NAME,
} from '../telegram-queue/telegram-queue.constants';

export type AuthUser = { id: number; email: string };

@Injectable()
export class TelegramAccountsService {
  private readonly logger = new Logger(TelegramAccountsService.name);

  constructor(
    @InjectQueue(TELEGRAM_QUEUE_NAME)
    private readonly telegramQueue: Queue
  ) {}

  // Architectural note:
  // Service stays thin and only coordinates job creation (application layer).
  // This keeps HTTP and Telegram side effects outside the service and improves testability.
  async requestCode(phone: string, user: AuthUser) {
    try {
      const job = await this.telegramQueue.add(
        TELEGRAM_JOB_REQUEST_CODE,
        { phone, user },
        { attempts: 3, removeOnComplete: 100, removeOnFail: 200 }
      );

      this.logger.log(
        JSON.stringify({
          event: 'telegram_request_code_enqueued',
          jobId: job.id,
          userId: user.id,
          phone,
        })
      );

      return { jobId: String(job.id) };
    } catch (error: any) {
      this.logger.error(
        JSON.stringify({
          event: 'telegram_enqueue_request_code_failed',
          userId: user.id,
          phone,
          message: error?.message ?? 'unknown error',
        }),
        error?.stack
      );
      throw new InternalServerErrorException(
        'Не удалось поставить задачу request-code в очередь'
      );
    }
  }

  // Architectural note:
  // Verification is also asynchronous for back-pressure control and resilience.
  async verifyCode(phone: string, code: string, user: AuthUser) {
    try {
      const job = await this.telegramQueue.add(
        TELEGRAM_JOB_VERIFY_CODE,
        { phone, code, user },
        { attempts: 2, removeOnComplete: 100, removeOnFail: 200 }
      );

      this.logger.log(
        JSON.stringify({
          event: 'telegram_verify_enqueued',
          jobId: job.id,
          userId: user.id,
          phone,
        })
      );

      return { jobId: String(job.id) };
    } catch (error: any) {
      this.logger.error(
        JSON.stringify({
          event: 'telegram_enqueue_verify_failed',
          userId: user.id,
          phone,
          message: error?.message ?? 'unknown error',
        }),
        error?.stack
      );
      throw new InternalServerErrorException(
        'Не удалось поставить задачу verify в очередь'
      );
    }
  }
}
