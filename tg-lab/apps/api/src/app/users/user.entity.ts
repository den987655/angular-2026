import { CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { TelegramAccount } from '../telegram-accounts/telegram-account.entity';

@Entity('users')
@Unique(['authUserId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int' })
  authUserId!: number;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => TelegramAccount, (account) => account.user)
  telegramAccounts!: TelegramAccount[];
}
