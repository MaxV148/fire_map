import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Point, Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto, PaginatedEvents } from './dto/event-response.dto';
import { Event } from './entities/event.entity';
import { Tag } from '../tags/entities/tag.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { AuthGuard } from '../auth/auth.guard';
import { EventFilterDto } from './dto/event-filter.dto';

@Injectable()
@UseGuards(AuthGuard)
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    userId: number,
  ): Promise<EventResponseDto> {
    // Prüfe ob der User existiert
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }

    const event = new Event();
    event.name = createEventDto.name;
    event.description = createEventDto.description;
    event.createdBy = user;

    // Setze Location als Point-Objekt
    if (createEventDto.location) {
      event.location = {
        type: 'Point',
        coordinates: createEventDto.location,
      } as Point;
    }

    // Wenn Tag-IDs angegeben sind, lade die Tags und verknüpfe sie
    if (createEventDto.tagIds && createEventDto.tagIds.length > 0) {
      const tags = await this.tagRepository.find({
        where: createEventDto.tagIds.map((id) => ({ id })),
      });
      event.tags = tags;
    }

    // Wenn Vehicle-IDs angegeben sind, lade die Vehicles und verknüpfe sie
    if (createEventDto.vehicleIds && createEventDto.vehicleIds.length > 0) {
      const vehicles = await this.vehicleRepository.find({
        where: createEventDto.vehicleIds.map((id) => ({ id })),
      });
      event.vehicles = vehicles;
    }

    const savedEvent = await this.eventRepository.save(event);

    // Lade das Event mit Tags, Vehicles und createdBy für die Response
    const eventWithRelations = await this.eventRepository.findOne({
      where: { id: savedEvent.id },
      relations: ['tags', 'vehicles', 'createdBy'],
    });

    if (!eventWithRelations) {
      throw new NotFoundException('Event konnte nicht gefunden werden');
    }

    return this.mapToResponseDto(eventWithRelations);
  }

  private mapToResponseDto(event: Event): EventResponseDto {
    return {
      id: event.id,
      name: event.name,
      description: event.description || undefined,
      createdBy: {
        id: event.createdBy.id,
        firstName: event.createdBy.firstName,
        lastName: event.createdBy.lastName,
      },
      createdAt: event.createdAt,
      tags:
        event.tags?.map((tag) => ({
          id: tag.id,
          name: tag.name,
        })) || [],
      vehicles:
        event.vehicles?.map((vehicle) => ({
          id: vehicle.id,
          name: vehicle.name,
        })) || [],
      location: event.location
        ? [
            (event.location as any).coordinates[0],
            (event.location as any).coordinates[1],
          ]
        : undefined,
    };
  }

  async findAll(filter?: EventFilterDto): Promise<PaginatedEvents> {
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 10;

    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.tags', 'tag')
      .leftJoinAndSelect('event.vehicles', 'vehicle')
      .leftJoinAndSelect('event.createdBy', 'createdBy');

    if (filter?.name) {
      qb.andWhere('event.name ILIKE :name', { name: `%${filter.name}%` });
    }

    if (filter?.description) {
      qb.andWhere('event.description ILIKE :description', {
        description: `%${filter.description}%`,
      });
    }

    if (filter?.tagIds && filter.tagIds.length > 0) {
      qb.andWhere('tag.id IN (:...tagIds)', { tagIds: filter.tagIds });
    }

    if (filter?.vehicleIds && filter.vehicleIds.length > 0) {
      qb.andWhere('vehicle.id IN (:...vehicleIds)', {
        vehicleIds: filter.vehicleIds,
      });
    }

    if (filter?.startDate) {
      qb.andWhere('event.createdAt >= :startDate', {
        startDate: filter.startDate,
      });
    }

    if (filter?.endDate) {
      qb.andWhere('event.createdAt <= :endDate', { endDate: filter.endDate });
    }

    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('event.createdAt', 'DESC');

    const [events, totalCount] = await qb.getManyAndCount();

    return {
      items: events.map((event) => this.mapToResponseDto(event)),
      meta: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findOne(id: number): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['tags', 'vehicles', 'createdBy'],
    });

    if (!event) {
      throw new NotFoundException('Event nicht gefunden');
    }

    return this.mapToResponseDto(event);
  }

  async update(
    id: number,
    updateEventDto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!event) {
      throw new NotFoundException('Event nicht gefunden');
    }

    // Berechtigung wird bereits durch den Guard geprüft

    // Update Event-Eigenschaften
    if (updateEventDto.name !== undefined) {
      event.name = updateEventDto.name;
    }
    if (updateEventDto.description !== undefined) {
      event.description = updateEventDto.description;
    }

    // Update Location
    if (updateEventDto.location) {
      event.location = {
        type: 'Point',
        coordinates: updateEventDto.location,
      } as Point;
    }

    // Update Tags
    if (updateEventDto.tagIds !== undefined) {
      if (updateEventDto.tagIds.length > 0) {
        const tags = await this.tagRepository.find({
          where: updateEventDto.tagIds.map((tagId) => ({ id: tagId })),
        });
        event.tags = tags;
      } else {
        event.tags = [];
      }
    }

    // Update Vehicles
    if (updateEventDto.vehicleIds !== undefined) {
      if (updateEventDto.vehicleIds.length > 0) {
        const vehicles = await this.vehicleRepository.find({
          where: updateEventDto.vehicleIds.map((vehicleId) => ({
            id: vehicleId,
          })),
        });
        event.vehicles = vehicles;
      } else {
        event.vehicles = [];
      }
    }

    const savedEvent = await this.eventRepository.save(event);

    // Lade das aktualisierte Event mit Relations
    const updatedEvent = await this.eventRepository.findOne({
      where: { id: savedEvent.id },
      relations: ['tags', 'vehicles', 'createdBy'],
    });

    if (!updatedEvent) {
      throw new NotFoundException('Event konnte nicht aktualisiert werden');
    }

    return this.mapToResponseDto(updatedEvent);
  }

  async remove(id: number): Promise<void> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!event) {
      throw new NotFoundException('Event nicht gefunden');
    }

    // Berechtigung wird bereits durch den Guard geprüft

    await this.eventRepository.remove(event);
  }
}
