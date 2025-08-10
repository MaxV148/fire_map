import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Role entity for user authorization and permissions.
 * Defines different user roles in the system.
 */
@Entity('role')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, nullable: false })
  @Index()
  name: string;

  @Column({ length: 250, nullable: false })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
