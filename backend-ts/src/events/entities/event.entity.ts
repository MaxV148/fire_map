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
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

/**
 * Event entity representing events in the fire map system.
 * Contains location data, tags, and associated vehicles.
 */
@Entity('event')
export class Event {
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.events, { nullable: false })
  createdBy: User;

  @ManyToMany(() => Tag, (tag) => tag.events, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'event_tags',
    joinColumn: {
      name: 'event_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  tags: Tag[];

  @ManyToMany(() => Vehicle, (vehicle) => vehicle.events, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'event_vehicles',
    joinColumn: {
      name: 'event_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'vehicle_id',
      referencedColumnName: 'id',
    },
  })
  vehicles: Vehicle[];
}
