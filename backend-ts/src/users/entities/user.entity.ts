import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Event } from '../../events/entities/event.entity';
import { Issue } from '../../issues/entities/issue.entity';
import { OtpSettings } from '../../otp-settings/entities/otp-setting.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

/**
 * User entity representing system users.
 * Contains authentication data, profile information, and relationships.
 */
@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  @Index()
  email: string;

  @Column({ length: 100, nullable: false })
  firstName: string;

  @Column({ length: 100, nullable: false })
  lastName: string;

  @Column({ nullable: false })
  @Index()
  password: string;

  @Column({ nullable: false, default: 1 })
  @Index()
  roleId: number;

  @Column({ default: false, nullable: false })
  deactivated: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Role, (role) => role.users, { nullable: false })
  @JoinColumn()
  role: Role;

  @ManyToOne(() => Tag, (tag) => tag.createdBy, { nullable: true })
  @JoinColumn()
  tags: Tag[];

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.createdBy, { nullable: true })
  @JoinColumn()
  vehicles: Vehicle[];

  @OneToMany(() => Event, (event) => event.createdBy, { lazy: true })
  events: Event[];

  @OneToMany(() => Issue, (issue) => issue.createdBy, { lazy: true })
  issues: Issue[];

  @OneToOne(() => OtpSettings, (otpSettings) => otpSettings.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  otpSettings: OtpSettings;
}
