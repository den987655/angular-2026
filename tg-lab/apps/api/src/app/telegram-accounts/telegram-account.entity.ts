import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum TelegramAccountStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  BANNED = 'banned',
}

@Entity('telegram_accounts')
@Unique(['userId', 'phone'])
export class TelegramAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  phone!: string;

  @Column({ type: 'text', nullable: true })
  sessionString!: string | null;

  @Column({
    type: 'simple-enum',
    enum: TelegramAccountStatus,
    default: TelegramAccountStatus.PENDING,
  })
  status!: TelegramAccountStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.telegramAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
