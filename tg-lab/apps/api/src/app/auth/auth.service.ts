import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { EmailService } from './email.service';

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  confirmationToken: string | null;
  createdAt: Date;
}

const users = new Map<number, User>();
const usersByEmail = new Map<string, User>();
const confirmationTokens = new Map<string, number>();
let nextId = 1;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService
  ) {}

  async signup(email: string, password: string): Promise<{ message: string }> {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password || password.length < 4) {
      throw new BadRequestException('Email и пароль обязательны (пароль от 4 символов)');
    }

    if (usersByEmail.has(normalized)) {
      throw new BadRequestException('Пользователь с таким email уже существует');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const confirmationToken = randomBytes(32).toString('hex');
    const user: User = {
      id: nextId++,
      email: normalized,
      passwordHash,
      emailVerified: false,
      confirmationToken,
      createdAt: new Date(),
    };
    users.set(user.id, user);
    usersByEmail.set(normalized, user);
    confirmationTokens.set(confirmationToken, user.id);

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const confirmLink = `${baseUrl}/confirm-email?token=${confirmationToken}`;
    await this.emailService.sendConfirmation(normalized, confirmLink);

    return {
      message:
        'Регистрация выполнена. Проверьте почту и перейдите по ссылке для подтверждения.',
    };
  }

  async confirmEmail(token: string): Promise<{ message: string }> {
    const userId = confirmationTokens.get(token);
    if (!userId) {
      throw new BadRequestException('Недействительная ссылка подтверждения');
    }
    const user = users.get(userId);
    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }
    user.emailVerified = true;
    user.confirmationToken = null;
    confirmationTokens.delete(token);
    return { message: 'Email подтверждён. Теперь вы можете войти.' };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: { id: number; email: string } }> {
    const normalized = email.trim().toLowerCase();
    const user = usersByEmail.get(normalized);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Подтвердите email по ссылке из письма перед входом'
      );
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    return {
      token,
      user: { id: user.id, email: user.email },
    };
  }

  async getProfile(userId: number): Promise<{ id: number; email: string }> {
    const user = users.get(userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    return { id: user.id, email: user.email };
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const user = users.get(userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('Неверный текущий пароль');
    }
    if (!newPassword || newPassword.length < 4) {
      throw new BadRequestException('Новый пароль должен быть от 4 символов');
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    return { message: 'Пароль успешно изменён' };
  }
}
