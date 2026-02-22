import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthUser } from '../auth/auth-user.entity';
import { Session } from '../auth/session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthUser, Session])],
})
export class AuthPersistenceModule {}
