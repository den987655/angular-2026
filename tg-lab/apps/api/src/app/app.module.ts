import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthPersistenceModule } from './auth-persistence/auth-persistence.module';
import { ProfileModule } from './profile/profile.module';
import { TariffsController } from './tariffs.controller';
import { TelegramAccountsModule } from './telegram-accounts/telegram-accounts.module';

@Module({
  imports: [
    // Changed from sqljs file DB to PostgreSQL configured by env variables.
    // Why: PostgreSQL is production-ready (real client/server DB, concurrent access,
    // durability/recovery guarantees, indexing/query planning), while sqljs is mainly
    // an embedded/in-memory style option suitable for demos and local prototypes.
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'tglab',
      autoLoadEntities: true,
      // Never use synchronize in production: it can drop/change tables unexpectedly.
      // Use migrations for controlled, reviewable schema changes instead.
      synchronize: false,
    }),
    AuthPersistenceModule,
    AuthModule,
    ProfileModule,
    TelegramAccountsModule,
  ],
  controllers: [AppController, TariffsController],
  providers: [AppService],
})
export class AppModule {}
