import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Index,
} from 'typeorm';
import type { Point } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tag } from '../../tags/entities/tag.entity';

/**
 * Issue entity representing reported issues in the fire map system.
 * Contains location data and is associated with tags and users.
 */
@Entity('issue')
export class Issue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: false })
  @Index()
  name: string;

  @Column({ length: 250, nullable: true })
  description: string;


  @Column({
    type: 'geography',
    srid: 4326,
    spatialFeatureType: 'Point',
    nullable: true,
  })
  location: Point;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.issues, { nullable: false })
  createdBy: User;

  @ManyToMany(() => Tag, (tag) => tag.issues, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'issue_tags',
    joinColumn: {
      name: 'issueId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tagId',
      referencedColumnName: 'id',
    },
  })
  tags: Tag[];
}
