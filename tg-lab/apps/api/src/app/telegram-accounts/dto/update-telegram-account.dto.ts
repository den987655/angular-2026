import { TelegramAccountStatus } from '../telegram-account.entity';

export class UpdateTelegramAccountDto {
  phone?: string;
  sessionString?: string | null;
  status?: TelegramAccountStatus;
}
