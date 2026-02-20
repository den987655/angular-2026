import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  async getProfile(@CurrentUser() user: { id: number; email: string }) {
    return this.authService.getProfile(user.id);
  }

  @Post('change-password')
  async changePassword(
    @CurrentUser() user: { id: number; email: string },
    @Body() body: { oldPassword?: string; newPassword?: string }
  ) {
    const oldPassword = body.oldPassword ?? '';
    const newPassword = body.newPassword ?? '';
    return this.authService.changePassword(user.id, oldPassword, newPassword);
  }
}
