import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramQueueModule } from '../telegram-queue/telegram-queue.module';
import { User } from '../users/user.entity';
import { TelegramAccount } from './telegram-account.entity';
import { TelegramAccountsController } from './telegram-accounts.controller';
import { TelegramAccountsProcessor } from './telegram-accounts.processor';
import { TelegramAccountsService } from './telegram-accounts.service';
import { TelegramAccountsStore } from './telegram-accounts.store';

@Module({
  imports: [TypeOrmModule.forFeature([User, TelegramAccount]), TelegramQueueModule],
  controllers: [TelegramAccountsController],
  providers: [
    // Architectural note:
    // Controller -> Service (enqueue only) -> Processor (Telegram API side effects)
    // and Store for persistence logic. This separation keeps boundaries explicit.
    TelegramAccountsService,
    TelegramAccountsStore,
    TelegramAccountsProcessor,
  ],
})
export class TelegramAccountsModule {}
