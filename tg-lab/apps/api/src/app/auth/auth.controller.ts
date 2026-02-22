import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() body: { email?: string; password?: string }
  ): Promise<{ message: string }> {
    const email = body.email ?? '';
    const password = body.password ?? '';
    return this.authService.signup(email, password);
  }

  @Get('confirm-email')
  async confirmEmail(
    @Query('token') token: string
  ): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException('Токен подтверждения обязателен');
    }
    return this.authService.confirmEmail(token);
  }

  @Post('login')
  async login(
    @Body() body: { email?: string; password?: string }
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    token: string;
    user: { id: number; email: string };
  }> {
    const email = body.email ?? '';
    const password = body.password ?? '';
    return this.authService.login(email, password);
  }

  @Post('refresh')
  async refresh(
    @Body() body: { refreshToken?: string }
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = body.refreshToken ?? '';
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  async logout(
    @Body() body: { refreshToken?: string }
  ): Promise<{ message: string }> {
    const refreshToken = body.refreshToken ?? '';
    return this.authService.logout(refreshToken);
  }
}
