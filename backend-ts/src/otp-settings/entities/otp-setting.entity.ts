import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * OTP Settings entity for two-factor authentication configuration.
 * One-to-one relationship with User entity.
 */
@Entity('otp_settings')
export class OtpSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  userId: number;

  @Column({ default: false, nullable: false })
  otpConfigured: boolean;

  @Column({ length: 32, nullable: true })
  secret: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationship
  @OneToOne(() => User, (user) => user.otpSettings, { onDelete: 'CASCADE' })
  user: User;
}
