import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagResponseDto } from './dto/tag-response.dto';

describe('TagsController', () => {
  let controller: TagsController;
  let service: jest.Mocked<Pick<
    TagsService,
    'create' | 'findAll' | 'update' | 'remove'
  >>;

  beforeEach(async () => {
    const mockTagsService: jest.Mocked<
      Pick<TagsService, 'create' | 'findAll' | 'update' | 'remove'>
    > = {
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [
        {
          provide: TagsService,
          useValue: mockTagsService,
        },
      ],
    }).compile();

    controller = module.get<TagsController>(TagsController);
    service = module.get(TagsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to service.create with parsed userId and return result', async () => {
      const dto: CreateTagDto = { name: 'alpha' };
      const userId: string = '5';
      const expected: TagResponseDto = {
        id: 1,
        name: 'alpha',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      };
      service.create.mockResolvedValueOnce(expected);

      const actual = await controller.create(dto, userId);

      expect(service.create).toHaveBeenCalledWith(dto, 5);
      expect(actual).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return all tags', async () => {
      const expected: TagResponseDto[] = [
        {
          id: 1,
          name: 'alpha',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        },
      ];
      service.findAll.mockResolvedValueOnce(expected);

      const actual = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(actual).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should delegate to service.update and return updated tag', async () => {
      const idParam: string = '10';
      const dto: UpdateTagDto = { name: 'beta' };
      const expected: TagResponseDto = {
        id: 10,
        name: 'beta',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-03T00:00:00.000Z'),
      };
      service.update.mockResolvedValueOnce(expected);

      const actual = await controller.update(idParam, dto);

      expect(service.update).toHaveBeenCalledWith(10, dto);
      expect(actual).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to service.remove with numeric id', async () => {
      const idParam: string = '7';
      service.remove.mockResolvedValueOnce(undefined);

      const actual = await controller.remove(idParam);

      expect(service.remove).toHaveBeenCalledWith(7);
      expect(actual).toBeUndefined();
    });
  });
});
