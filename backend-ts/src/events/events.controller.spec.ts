import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { EventResponseDto, PaginatedEvents } from './dto/event-response.dto';
import { EventOwnerOrAdminGuard } from '../auth/owner-or-admin.guard';

describe('EventsController', () => {
  let controller: EventsController;
  let service: jest.Mocked<
    Pick<EventsService, 'create' | 'findAll' | 'findOne' | 'update' | 'remove'>
  >;

  beforeEach(async () => {
    const mockService: jest.Mocked<
      Pick<EventsService, 'create' | 'findAll' | 'findOne' | 'update' | 'remove'>
    > = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const moduleBuilder = Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockService,
        },
      ],
    }).overrideGuard(EventOwnerOrAdminGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to service.create with parsed userId and return result', async () => {
      const dto: CreateEventDto = {
        name: 'Fire Drill',
        description: 'Quarterly drill',
        location: [10.1, 49.2],
        tagIds: [1, 2],
        vehicleIds: [3],
      };
      const expected: EventResponseDto = {
        id: 1,
        name: 'Fire Drill',
        description: 'Quarterly drill',
        location: [10.1, 49.2],
        tags: [
          { id: 1, name: 'training' },
          { id: 2, name: 'safety' },
        ],
        vehicles: [{ id: 3, name: 'Truck' }],
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      };
      service.create.mockResolvedValueOnce(expected);

      const result = await controller.create(dto, '9');

      expect(service.create).toHaveBeenCalledWith(dto, 9);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should pass filter to service and return events', async () => {
      const filter: EventFilterDto = { name: 'Drill', page: 2, limit: 5 } as any;
      const expected: PaginatedEvents = {
        items: [
          {
            id: 2,
            name: 'Fire Drill 2',
            description: 'Quarterly drill 2',
            location: [11.1, 48.2],
            tags: [],
            vehicles: [],
            createdAt: new Date('2024-02-01T00:00:00.000Z'),
          },
        ],
        meta: {
          totalCount: 1,
          page: 2,
          limit: 5,
          totalPages: 1,
        },
      };
      service.findAll.mockResolvedValueOnce(expected as any);

      const result = await controller.findAll(filter);

      expect(service.findAll).toHaveBeenCalledWith(filter);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should convert id to number and return event', async () => {
      const expected: EventResponseDto = {
        id: 5,
        name: 'Parade',
        description: 'Annual parade',
        location: [12.0, 50.0],
        tags: [],
        vehicles: [],
        createdAt: new Date('2024-03-01T00:00:00.000Z'),
      };
      service.findOne.mockResolvedValueOnce(expected);

      const result = await controller.findOne('5');

      expect(service.findOne).toHaveBeenCalledWith(5);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should delegate to service.update with numeric id and return updated event', async () => {
      const dto: UpdateEventDto = { name: 'Updated Parade', description: 'Updated' };
      const expected: EventResponseDto = {
        id: 5,
        name: 'Updated Parade',
        description: 'Updated',
        location: [12.0, 50.0],
        tags: [],
        vehicles: [],
        createdAt: new Date('2024-03-01T00:00:00.000Z'),
      };
      service.update.mockResolvedValueOnce(expected);

      const result = await controller.update('5', dto);

      expect(service.update).toHaveBeenCalledWith(5, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to service.remove with numeric id', async () => {
      service.remove.mockResolvedValueOnce(undefined);

      const result = await controller.remove('5');

      expect(service.remove).toHaveBeenCalledWith(5);
      expect(result).toBeUndefined();
    });
  });
});
