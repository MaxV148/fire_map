import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';

describe('RolesController', () => {
  let controller: RolesController;
  let service: jest.Mocked<
    Pick<RolesService, 'create' | 'findAll' | 'findOne' | 'update' | 'remove'>
  >;

  beforeEach(async () => {
    const mockService: jest.Mocked<
      Pick<
        RolesService,
        'create' | 'findAll' | 'findOne' | 'update' | 'remove'
      >
    > = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to service.create with parsed userId and return result', async () => {
      const dto: CreateRoleDto = { name: 'manager', description: 'Can manage' };
      const expected: RoleResponseDto = {
        id: 1,
        name: 'manager',
        description: 'Can manage',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      };
      service.create.mockResolvedValueOnce(expected);

      const result = await controller.create(dto, '5');

      expect(service.create).toHaveBeenCalledWith(dto, 5);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const expected: RoleResponseDto[] = [
        {
          id: 1,
          name: 'user',
          description: 'Default user',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        },
      ];
      service.findAll.mockResolvedValueOnce(expected);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should convert id to number and return role', async () => {
      const expected: RoleResponseDto = {
        id: 3,
        name: 'admin',
        description: 'Administrator',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-03T00:00:00.000Z'),
      };
      service.findOne.mockResolvedValueOnce(expected);

      const result = await controller.findOne('3');

      expect(service.findOne).toHaveBeenCalledWith(3);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should delegate to service.update and return updated role', async () => {
      const dto: UpdateRoleDto = { name: 'power-user', description: 'Elevated rights' };
      const expected: RoleResponseDto = {
        id: 10,
        name: 'power-user',
        description: 'Elevated rights',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-04T00:00:00.000Z'),
      };
      service.update.mockResolvedValueOnce(expected);

      const result = await controller.update('10', dto);

      expect(service.update).toHaveBeenCalledWith(10, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to service.remove with numeric id', async () => {
      service.remove.mockResolvedValueOnce(undefined);

      const result = await controller.remove('7');

      expect(service.remove).toHaveBeenCalledWith(7);
      expect(result).toBeUndefined();
    });
  });
});
