import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { Tag } from '../tags/entities/tag.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { EventOwnerOrAdminGuard } from '../auth/owner-or-admin.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Tag, User, Vehicle])],
  controllers: [EventsController],
  providers: [EventsService, EventOwnerOrAdminGuard],
})
export class EventsModule {}
