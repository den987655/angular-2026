import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { Session } from './session.entity';

@Entity('auth_users')
@Unique(['email'])
export class AuthUser {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ type: 'varchar', length: 128, nullable: true })
  confirmationToken!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Session[];
}
