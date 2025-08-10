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
import { Issue } from '../../issues/entities/issue.entity';
import {User} from "../../users/entities/user.entity";

/**
 * Tag entity for categorizing events and issues.
 * Provides a many-to-many relationship with both events and issues.
 */
@Entity('tag')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: false })
  @Index()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.tags, { nullable: false })
  createdBy: User;

  @ManyToMany(() => Event, (event) => event.tags)
  events: Event[];

  @ManyToMany(() => Issue, (issue) => issue.tags)
  issues: Issue[];
}
