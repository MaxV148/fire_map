import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedUserResponseDto, UserResponseDto } from './dto/user-response.dto';
import { UserFilterDto } from './dto/user-filter.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserResponse: UserResponseDto = {
    id: 1,
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    role: 'user',
    deactivated: false,
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'new.user@example.com',
    password: 'password123',
    firstName: 'New',
    lastName: 'User',
  };

  const mockUpdateUserDto: UpdateUserDto = {
    email: 'updated.user@example.com',
    firstName: 'Updated',
    lastName: 'User',
    deactivated: true,
  };

  const mockPaginatedResponse: PaginatedUserResponseDto = {
    users: [mockUserResponse],
    totalCount: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      mockUsersService.create.mockResolvedValue(mockUserResponse);
      const result = await controller.login(mockCreateUserDto);
      expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(mockUserResponse);
    });

    it('should propagate service errors', async () => {
      const errorMessage = 'Default user role not found. Please ensure database seeding has been completed.';
      mockUsersService.create.mockRejectedValue(new Error(errorMessage));
      await expect(controller.login(mockCreateUserDto)).rejects.toThrow(errorMessage);
    });
  });

  describe('findAll', () => {
    it('should return paginated users with provided filter', async () => {
      const filter: UserFilterDto = { page: 2, limit: 5 } as UserFilterDto;
      mockUsersService.findAll.mockResolvedValue(mockPaginatedResponse);
      const result = await controller.findAll(filter);
      expect(service.findAll).toHaveBeenCalledWith(filter);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should work with empty filter object', async () => {
      const emptyFilter = {} as unknown as UserFilterDto;
      mockUsersService.findAll.mockResolvedValue({
        users: [],
        totalCount: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
      const result = await controller.findAll(emptyFilter);
      expect(service.findAll).toHaveBeenCalledWith(emptyFilter);
      expect(result).toEqual({ users: [], totalCount: 0, page: 1, limit: 10, totalPages: 0 });
    });

    it('should propagate service errors', async () => {
      const filter: UserFilterDto = { page: 1, limit: 10 } as UserFilterDto;
      const errorMessage = 'Database unavailable';
      mockUsersService.findAll.mockRejectedValue(new Error(errorMessage));
      await expect(controller.findAll(filter)).rejects.toThrow(errorMessage);
    });
  });

  describe('update', () => {
    it('should update a user and convert id to number', async () => {
      const id = '123';
      const serviceResponse = 'updated';
      mockUsersService.update.mockResolvedValue(serviceResponse);
      const result = await controller.update(id, mockUpdateUserDto);
      expect(service.update).toHaveBeenCalledWith(123, mockUpdateUserDto);
      expect(result).toEqual(serviceResponse);
    });

    it('should propagate service errors', async () => {
      const id = '1';
      const errorMessage = 'User not found';
      mockUsersService.update.mockRejectedValue(new Error(errorMessage));
      await expect(controller.update(id, mockUpdateUserDto)).rejects.toThrow(errorMessage);
    });

    it('should pass NaN when id is not numeric', async () => {
      const id = 'abc';
      mockUsersService.update.mockResolvedValue('updated');
      await controller.update(id, mockUpdateUserDto);
      expect(service.update).toHaveBeenCalledWith(NaN, mockUpdateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user and convert id to number', async () => {
      const id = '42';
      const serviceResponse = 'removed';
      mockUsersService.remove.mockResolvedValue(serviceResponse);
      const result = await controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(42);
      expect(result).toEqual(serviceResponse);
    });

    it('should propagate service errors', async () => {
      const id = '2';
      const errorMessage = 'User not found';
      mockUsersService.remove.mockRejectedValue(new Error(errorMessage));
      await expect(controller.remove(id)).rejects.toThrow(errorMessage);
    });

    it('should pass NaN when id is not numeric', async () => {
      const id = 'xyz';
      mockUsersService.remove.mockResolvedValue('removed');
      await controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(NaN);
    });
  });
});
