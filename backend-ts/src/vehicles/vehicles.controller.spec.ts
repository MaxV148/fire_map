import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';

describe('VehiclesController', () => {
  let controller: VehiclesController;
  let service: VehiclesService;

  const mockVehiclesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockVehicleResponse: VehicleResponseDto = {
    id: 1,
    name: 'Test Vehicle',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  const mockCreateVehicleDto: CreateVehicleDto = {
    name: 'New Vehicle',
  };

  const mockUpdateVehicleDto: UpdateVehicleDto = {
    name: 'Updated Vehicle',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclesController],
      providers: [
        {
          provide: VehiclesService,
          useValue: mockVehiclesService,
        },
      ],
    }).compile();

    controller = module.get<VehiclesController>(VehiclesController);
    service = module.get<VehiclesService>(VehiclesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new vehicle', async () => {
      // Arrange
      const userId = '123';
      const expectedResult = mockVehicleResponse;
      mockVehiclesService.create.mockResolvedValue(expectedResult);

      // Act
      const actualResult = await controller.create(mockCreateVehicleDto, userId);

      // Assert
      expect(service.create).toHaveBeenCalledWith(mockCreateVehicleDto, 123);
      expect(actualResult).toEqual(expectedResult);
    });

    it('should convert userId string to number', async () => {
      // Arrange
      const userId = '456';
      mockVehiclesService.create.mockResolvedValue(mockVehicleResponse);

      // Act
      await controller.create(mockCreateVehicleDto, userId);

      // Assert
      expect(service.create).toHaveBeenCalledWith(mockCreateVehicleDto, 456);
    });
  });

  describe('findAll', () => {
    it('should return all vehicles', async () => {
      // Arrange
      const expectedVehicles = [mockVehicleResponse];
      mockVehiclesService.findAll.mockResolvedValue(expectedVehicles);

      // Act
      const actualVehicles = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalled();
      expect(actualVehicles).toEqual(expectedVehicles);
    });

    it('should return empty array when no vehicles exist', async () => {
      // Arrange
      const expectedVehicles: VehicleResponseDto[] = [];
      mockVehiclesService.findAll.mockResolvedValue(expectedVehicles);

      // Act
      const actualVehicles = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalled();
      expect(actualVehicles).toEqual(expectedVehicles);
    });
  });

  describe('findOne', () => {
    it('should return a vehicle by id', async () => {
      // Arrange
      const vehicleId = '1';
      const expectedVehicle = mockVehicleResponse;
      mockVehiclesService.findOne.mockResolvedValue(expectedVehicle);

      // Act
      const actualVehicle = await controller.findOne(vehicleId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(actualVehicle).toEqual(expectedVehicle);
    });

    it('should convert string id to number', async () => {
      // Arrange
      const vehicleId = '999';
      mockVehiclesService.findOne.mockResolvedValue(mockVehicleResponse);

      // Act
      await controller.findOne(vehicleId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('should update a vehicle', async () => {
      // Arrange
      const vehicleId = '1';
      const expectedResult = { ...mockVehicleResponse, name: 'Updated Vehicle' };
      mockVehiclesService.update.mockResolvedValue(expectedResult);

      // Act
      const actualResult = await controller.update(vehicleId, mockUpdateVehicleDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, mockUpdateVehicleDto);
      expect(actualResult).toEqual(expectedResult);
    });

    it('should convert string id to number for update', async () => {
      // Arrange
      const vehicleId = '777';
      mockVehiclesService.update.mockResolvedValue(mockVehicleResponse);

      // Act
      await controller.update(vehicleId, mockUpdateVehicleDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(777, mockUpdateVehicleDto);
    });
  });

  describe('remove', () => {
    it('should remove a vehicle', async () => {
      // Arrange
      const vehicleId = '1';
      mockVehiclesService.remove.mockResolvedValue(undefined);

      // Act
      const actualResult = await controller.remove(vehicleId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(actualResult).toBeUndefined();
    });

    it('should convert string id to number for remove', async () => {
      // Arrange
      const vehicleId = '555';
      mockVehiclesService.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(vehicleId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(555);
    });
  });

  describe('error handling', () => {
    it('should propagate service errors in create', async () => {
      // Arrange
      const userId = '123';
      const errorMessage = 'Benutzer nicht gefunden';
      mockVehiclesService.create.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.create(mockCreateVehicleDto, userId)).rejects.toThrow(errorMessage);
    });

    it('should propagate service errors in findOne', async () => {
      // Arrange
      const vehicleId = '1';
      const errorMessage = 'Fahrzeug nicht gefunden';
      mockVehiclesService.findOne.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.findOne(vehicleId)).rejects.toThrow(errorMessage);
    });

    it('should propagate service errors in update', async () => {
      // Arrange
      const vehicleId = '1';
      const errorMessage = 'Fahrzeug nicht gefunden';
      mockVehiclesService.update.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.update(vehicleId, mockUpdateVehicleDto)).rejects.toThrow(errorMessage);
    });

    it('should propagate service errors in remove', async () => {
      // Arrange
      const vehicleId = '1';
      const errorMessage = 'Fahrzeug nicht gefunden';
      mockVehiclesService.remove.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.remove(vehicleId)).rejects.toThrow(errorMessage);
    });
  });

  describe('parameter validation', () => {
    it('should handle empty string id in findOne', async () => {
      // Arrange
      const vehicleId = '';
      mockVehiclesService.findOne.mockResolvedValue(mockVehicleResponse);

      // Act
      await controller.findOne(vehicleId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(0);
    });

    it('should handle non-numeric string id in findOne', async () => {
      // Arrange
      const vehicleId = 'abc';
      mockVehiclesService.findOne.mockResolvedValue(mockVehicleResponse);

      // Act
      await controller.findOne(vehicleId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(NaN);
    });
  });
});
