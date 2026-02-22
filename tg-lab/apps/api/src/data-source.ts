import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AuthUser } from './app/auth/auth-user.entity';
import { Session } from './app/auth/session.entity';
import { TelegramAccount } from './app/telegram-accounts/telegram-account.entity';
import { User } from './app/users/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'tglab',
  entities: [AuthUser, Session, TelegramAccount, User],
  // Migrations are required for production to make schema changes explicit,
  // reviewable, and repeatable across environments.
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});

export default AppDataSource;
