import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Invite entity representing user invitations to the system.
 * Contains invitation UUID, email, expiration, and relationship to creator.
 */
@Entity('invite')
export class Invite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true, nullable: false })
  @Index()
  inviteUuid: string;

  @Column({ nullable: false })
  @Index()
  email: string;

  @Column({ type: 'timestamp', nullable: false })
  expireDate: Date;

  @Column({ default: false, nullable: false })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, { nullable: true })
  createdBy: User;
}
