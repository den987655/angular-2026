import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../profile/current-user.decorator';
import { CreateTelegramAccountDto } from './dto/create-telegram-account.dto';
import { RequestCodeDto } from './dto/request-code.dto';
import { UpdateTelegramAccountDto } from './dto/update-telegram-account.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { TelegramAccountsService } from './telegram-accounts.service';
import { TelegramAccountsStore } from './telegram-accounts.store';

@Controller('telegram-accounts')
@UseGuards(JwtAuthGuard)
export class TelegramAccountsController {
  constructor(
    private readonly telegramAccountsService: TelegramAccountsService,
    private readonly telegramAccountsStore: TelegramAccountsStore
  ) {}

  @Post('request-code')
  async requestCode(
    @Body() dto: RequestCodeDto,
    @CurrentUser() user: { id: number; email: string }
  ) {
    return this.telegramAccountsService.requestCode(dto.phone, user);
  }

  @Post('verify')
  async verifyCode(
    @Body() dto: VerifyCodeDto,
    @CurrentUser() user: { id: number; email: string }
  ) {
    return this.telegramAccountsService.verifyCode(dto.phone, dto.code, user);
  }

  @Get()
  findAll(@CurrentUser() user: { id: number; email: string }) {
    return this.telegramAccountsStore.findAll(user);
  }

  @Post()
  create(
    @Body() dto: CreateTelegramAccountDto,
    @CurrentUser() user: { id: number; email: string }
  ) {
    return this.telegramAccountsStore.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTelegramAccountDto,
    @CurrentUser() user: { id: number; email: string }
  ) {
    return this.telegramAccountsStore.update(id, dto, user);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: number; email: string }
  ) {
    return this.telegramAccountsStore.remove(id, user);
  }
}
