import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  Index, ManyToOne,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import {User} from "../../users/entities/user.entity";

/**
 * Vehicle entity representing vehicle types in the system.
 * Can be associated with multiple events through a many-to-many relationship.
 */
@Entity('vehicletype')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: false })
  @Index()
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.vehicles, { nullable: true })
  createdBy: User;

  @ManyToMany(() => Event, (event) => event.vehicles)
  events: Event[];
}
