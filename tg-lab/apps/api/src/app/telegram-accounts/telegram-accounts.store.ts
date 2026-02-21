import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import {
  TelegramAccount,
  TelegramAccountStatus,
} from './telegram-account.entity';
import { CreateTelegramAccountDto } from './dto/create-telegram-account.dto';
import { UpdateTelegramAccountDto } from './dto/update-telegram-account.dto';

type AuthUser = { id: number; email: string };

@Injectable()
export class TelegramAccountsStore {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(TelegramAccount)
    private readonly telegramAccountsRepository: Repository<TelegramAccount>
  ) {}

  async findAll(authUser: AuthUser) {
    const owner = await this.getOrCreateOwner(authUser);
    const accounts = await this.telegramAccountsRepository.find({
      where: { userId: owner.id },
      order: { createdAt: 'DESC' },
    });
    return accounts.map((account) => this.toPublicAccount(account));
  }

  async create(dto: CreateTelegramAccountDto, authUser: AuthUser) {
    const owner = await this.getOrCreateOwner(authUser);
    const phone = this.normalizePhone(dto.phone);
    const account = this.telegramAccountsRepository.create({
      phone,
      sessionString: this.encryptNullable(dto.sessionString ?? null),
      status: dto.status ?? TelegramAccountStatus.PENDING,
      userId: owner.id,
    });
    const saved = await this.telegramAccountsRepository.save(account);
    return this.toPublicAccount(saved);
  }

  async update(id: string, dto: UpdateTelegramAccountDto, authUser: AuthUser) {
    const owner = await this.getOrCreateOwner(authUser);
    const account = await this.telegramAccountsRepository.findOne({
      where: { id, userId: owner.id },
    });
    if (!account) {
      throw new NotFoundException('Аккаунт не найден');
    }

    if (dto.phone !== undefined) {
      account.phone = this.normalizePhone(dto.phone);
    }
    if (dto.sessionString !== undefined) {
      account.sessionString = this.encryptNullable(dto.sessionString);
    }
    if (dto.status !== undefined) {
      account.status = dto.status;
    }

    const saved = await this.telegramAccountsRepository.save(account);
    return this.toPublicAccount(saved);
  }

  async remove(id: string, authUser: AuthUser) {
    const owner = await this.getOrCreateOwner(authUser);
    const account = await this.telegramAccountsRepository.findOne({
      where: { id, userId: owner.id },
    });
    if (!account) {
      throw new NotFoundException('Аккаунт не найден');
    }
    await this.telegramAccountsRepository.delete({ id });
    return { message: 'Аккаунт удален' };
  }

  async findByPhoneForUser(phone: string, authUser: AuthUser) {
    const owner = await this.getOrCreateOwner(authUser);
    const normalizedPhone = this.normalizePhone(phone);
    const account = await this.telegramAccountsRepository.findOne({
      where: { userId: owner.id, phone: normalizedPhone },
    });
    return {
      owner,
      normalizedPhone,
      account,
      decryptedSessionString: account ? this.decryptNullable(account.sessionString) : null,
    };
  }

  async markPending(authUser: AuthUser, phone: string) {
    const owner = await this.getOrCreateOwner(authUser);
    return this.upsertAccount(owner.id, this.normalizePhone(phone), {
      status: TelegramAccountStatus.PENDING,
    });
  }

  async markActiveWithSession(authUser: AuthUser, phone: string, session: string | null) {
    const owner = await this.getOrCreateOwner(authUser);
    return this.upsertAccount(owner.id, this.normalizePhone(phone), {
      status: TelegramAccountStatus.ACTIVE,
      sessionString: session,
    });
  }

  toPublicAccount(account: TelegramAccount): TelegramAccount {
    return {
      ...account,
      sessionString: this.decryptNullable(account.sessionString),
    };
  }

  private async upsertAccount(
    userId: string,
    phone: string,
    patch: Partial<TelegramAccount>
  ) {
    const patchToSave: Partial<TelegramAccount> = { ...patch };
    if (patchToSave.sessionString !== undefined) {
      patchToSave.sessionString = this.encryptNullable(patchToSave.sessionString);
    }

    const existing = await this.telegramAccountsRepository.findOne({
      where: { userId, phone },
    });

    if (existing) {
      Object.assign(existing, patchToSave);
      return this.telegramAccountsRepository.save(existing);
    }

    const account = this.telegramAccountsRepository.create({
      userId,
      phone,
      sessionString: null,
      status: TelegramAccountStatus.PENDING,
      ...patchToSave,
    });
    return this.telegramAccountsRepository.save(account);
  }

  private async getOrCreateOwner(authUser: AuthUser) {
    const existing = await this.usersRepository.findOne({
      where: { authUserId: authUser.id },
    });
    if (existing) {
      if (existing.email !== authUser.email) {
        existing.email = authUser.email;
        await this.usersRepository.save(existing);
      }
      return existing;
    }

    const user = this.usersRepository.create({
      authUserId: authUser.id,
      email: authUser.email,
    });
    return this.usersRepository.save(user);
  }

  private normalizePhone(phone: string) {
    const value = (phone || '').trim();
    if (!value) {
      throw new BadRequestException('Телефон обязателен');
    }
    return value;
  }

  private encryptNullable(value: string | null | undefined): string | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    return this.encrypt(value);
  }

  private decryptNullable(value: string | null): string | null {
    if (!value) {
      return null;
    }
    return this.decrypt(value);
  }

  private getSessionKey(): Buffer {
    const secret = process.env.TELEGRAM_SESSION_SECRET || '';
    if (!secret) {
      throw new BadRequestException(
        'TELEGRAM_SESSION_SECRET не задан. Добавьте в .env'
      );
    }
    return createHash('sha256').update(secret).digest();
  }

  private encrypt(text: string): string {
    const key = this.getSessionKey();
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  private decrypt(text: string): string {
    const key = this.getSessionKey();
    const [ivHex, encryptedHex] = text.split(':');
    if (!ivHex || !encryptedHex) {
      throw new BadRequestException('Неверный формат зашифрованной сессии');
    }
    const decipher = createDecipheriv(
      'aes-256-cbc',
      key,
      Buffer.from(ivHex, 'hex')
    );
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }
}
