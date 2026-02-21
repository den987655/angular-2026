import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TELEGRAM_QUEUE_NAME } from './telegram-queue.constants';

@Module({
  imports: [
    // Queue improves scalability:
    // Telegram I/O is network-bound and can be slow; moving it into workers
    // lets API respond immediately and process jobs asynchronously under load.
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT || 6379),
      },
    }),
    BullModule.registerQueue({
      name: TELEGRAM_QUEUE_NAME,
    }),
  ],
  exports: [BullModule],
})
export class TelegramQueueModule {}
