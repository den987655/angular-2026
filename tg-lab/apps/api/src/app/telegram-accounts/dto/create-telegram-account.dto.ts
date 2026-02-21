import { TelegramAccountStatus } from '../telegram-account.entity';

export class CreateTelegramAccountDto {
  phone!: string;
  sessionString?: string | null;
  status?: TelegramAccountStatus;
}
