import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes, randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { AuthUser } from './auth-user.entity';
import { Session } from './session.entity';
import { EmailService } from './email.service';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource
  ) {}

  private authUsers() {
    return this.dataSource.getRepository(AuthUser);
  }

  private sessions() {
    return this.dataSource.getRepository(Session);
  }

  private appUsers() {
    return this.dataSource.getRepository(User);
  }

  async signup(email: string, password: string): Promise<{ message: string }> {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password || password.length < 4) {
      throw new BadRequestException(
        'Email и пароль обязательны (пароль от 4 символов)'
      );
    }

    const existing = await this.authUsers().findOne({
      where: { email: normalized },
    });
    if (existing) {
      throw new BadRequestException('Пользователь с таким email уже существует');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const confirmationToken = randomBytes(32).toString('hex');
    const user = this.authUsers().create({
      email: normalized,
      passwordHash,
      emailVerified: false,
      confirmationToken,
    });
    const saved = await this.authUsers().save(user);

    // Keep user mapping in app domain (Telegram accounts use authUserId for ownership).
    const appUser = await this.appUsers().findOne({
      where: { authUserId: saved.id },
    });
    if (!appUser) {
      await this.appUsers().save(
        this.appUsers().create({ authUserId: saved.id, email: saved.email })
      );
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const confirmLink = `${baseUrl}/confirm-email?token=${confirmationToken}`;
    await this.emailService.sendConfirmation(normalized, confirmLink);

    return {
      message:
        'Регистрация выполнена. Проверьте почту и перейдите по ссылке для подтверждения.',
    };
  }

  async confirmEmail(token: string): Promise<{ message: string }> {
    const user = await this.authUsers().findOne({
      where: { confirmationToken: token },
    });
    if (!user) {
      throw new BadRequestException('Недействительная ссылка подтверждения');
    }
    user.emailVerified = true;
    user.confirmationToken = null;
    await this.authUsers().save(user);
    return { message: 'Email подтверждён. Теперь вы можете войти.' };
  }

  async login(email: string, password: string): Promise<{
    accessToken: string;
    refreshToken: string;
    token: string;
    user: { id: number; email: string };
  }> {
    const normalized = email.trim().toLowerCase();
    const user = await this.authUsers().findOne({
      where: { email: normalized },
    });
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

    const { accessToken, refreshToken } = await this.issueTokens(user);
    return {
      accessToken,
      refreshToken,
      token: accessToken,
      user: { id: user.id, email: user.email },
    };
  }

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token обязателен');
    }

    const payload = this.verifyRefreshToken(refreshToken);
    const sessionId = payload.sessionId as string | undefined;
    if (!sessionId) {
      throw new UnauthorizedException('Недействительный refresh token');
    }

    const session = await this.sessions().findOne({ where: { id: sessionId } });
    if (!session) {
      throw new UnauthorizedException('Сессия не найдена');
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.sessions().delete({ id: session.id });
      throw new UnauthorizedException('Сессия истекла');
    }

    const matches = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!matches) {
      // Security: if token doesn't match stored hash, revoke the session.
      await this.sessions().delete({ id: session.id });
      throw new UnauthorizedException('Недействительный refresh token');
    }

    const user = await this.authUsers().findOne({ where: { id: session.userId } });
    if (!user) {
      await this.sessions().delete({ id: session.id });
      throw new UnauthorizedException('Пользователь не найден');
    }

    // Rotation: delete old session and issue a new pair of tokens.
    // This limits token replay and reduces impact of refresh token leakage.
    // Compared to basic JWT-only auth, this enables revocation and short-lived access tokens.
    await this.sessions().delete({ id: session.id });
    return this.issueTokens(user);
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token обязателен');
    }

    const payload = this.verifyRefreshToken(refreshToken);
    const sessionId = payload.sessionId as string | undefined;
    if (!sessionId) {
      throw new UnauthorizedException('Недействительный refresh token');
    }

    await this.sessions().delete({ id: sessionId });
    return { message: 'Вы вышли из системы' };
  }

  async getProfile(userId: number): Promise<{ id: number; email: string }> {
    const user = await this.authUsers().findOne({ where: { id: userId } });
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
    const user = await this.authUsers().findOne({ where: { id: userId } });
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
    await this.authUsers().save(user);
    return { message: 'Пароль успешно изменён' };
  }

  private verifyRefreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken) as {
        sub: number;
        email: string;
        tokenType?: string;
        sessionId?: string;
      };
      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Недействительный refresh token');
      }
      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Недействительный refresh token');
    }
  }

  private async issueTokens(user: AuthUser) {
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, tokenType: 'access' },
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    const sessionId = randomUUID();
    const refreshToken = this.jwtService.sign(
      { sub: user.id, email: user.email, tokenType: 'refresh', sessionId },
      { expiresIn: REFRESH_TOKEN_TTL }
    );

    // Security: store refresh tokens in DB as hashes to enable revocation and audit.
    // Keeping them server-side (not purely stateless) allows forced logout and rotation.
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const session = this.sessions().create({
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });
    await this.sessions().save(session);

    return { accessToken, refreshToken };
  }
}
