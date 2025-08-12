import { Test, TestingModule } from '@nestjs/testing';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { IssueFilterDto } from './dto/issue-filter.dto';
import { IssueResponseDto } from './dto/issue-response.dto';
import { IssueOwnerOrAdminGuard } from '../auth/owner-or-admin.guard';

describe('IssuesController', () => {
  let controller: IssuesController;
  let service: jest.Mocked<
    Pick<IssuesService, 'create' | 'findAll' | 'findOne' | 'update' | 'remove'>
  >;

  beforeEach(async () => {
    const mockService: jest.Mocked<
      Pick<
        IssuesService,
        'create' | 'findAll' | 'findOne' | 'update' | 'remove'
      >
    > = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const moduleBuilder = Test.createTestingModule({
      controllers: [IssuesController],
      providers: [
        {
          provide: IssuesService,
          useValue: mockService,
        },
      ],
    }).overrideGuard(IssueOwnerOrAdminGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<IssuesController>(IssuesController);
    service = module.get(IssuesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to service.create with parsed userId and return result', async () => {
      const dto: CreateIssueDto = {
        name: 'Leak',
        description: 'Water leak in building',
        tagIds: [1, 2],
        location: [10.1, 49.2],
      };
      const expected: IssueResponseDto = {
        id: 1,
        name: 'Leak',
        description: 'Water leak in building',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        tags: [
          { id: 1, name: 'urgent' },
          { id: 2, name: 'water' },
        ],
        location: [10.1, 49.2],
      };
      service.create.mockResolvedValueOnce(expected);

      const result = await controller.create(dto, '7');

      expect(service.create).toHaveBeenCalledWith(dto, 7);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should pass filter to service and return list', async () => {
      const filter: IssueFilterDto = { name: 'Leak', page: 2, limit: 5 } as any;
      const expected: IssueResponseDto[] = [
        {
          id: 3,
          name: 'Leak near pump',
          description: 'Minor leak',
          createdAt: new Date('2024-02-01T00:00:00.000Z'),
          tags: [],
        },
      ];
      service.findAll.mockResolvedValueOnce(expected);

      const result = await controller.findAll(filter);

      expect(service.findAll).toHaveBeenCalledWith(filter);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should convert id to number and return issue', async () => {
      const expected: IssueResponseDto = {
        id: 11,
        name: 'Broken valve',
        description: 'Valve not closing',
        createdAt: new Date('2024-03-01T00:00:00.000Z'),
        tags: [],
      };
      service.findOne.mockResolvedValueOnce(expected);

      const result = await controller.findOne('11');

      expect(service.findOne).toHaveBeenCalledWith(11);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should delegate to service.update with numeric id and return updated issue', async () => {
      const dto: UpdateIssueDto = { name: 'Fixed valve', description: 'Replaced seal' };
      const expected: IssueResponseDto = {
        id: 11,
        name: 'Fixed valve',
        description: 'Replaced seal',
        createdAt: new Date('2024-03-01T00:00:00.000Z'),
        tags: [],
      };
      service.update.mockResolvedValueOnce(expected);

      const result = await controller.update('11', dto);

      expect(service.update).toHaveBeenCalledWith(11, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to service.remove with numeric id', async () => {
      service.remove.mockResolvedValueOnce(undefined);

      const result = await controller.remove('22');

      expect(service.remove).toHaveBeenCalledWith(22);
      expect(result).toBeUndefined();
    });
  });
});
