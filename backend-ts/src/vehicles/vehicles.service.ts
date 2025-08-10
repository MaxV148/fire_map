import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
import { Vehicle } from './entities/vehicle.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto, userId: number): Promise<VehicleResponseDto> {
    // Prüfe ob der User existiert
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    
    if (!user) {
      throw new Error('Benutzer nicht gefunden');
    }

    const vehicle = new Vehicle();
    vehicle.name = createVehicleDto.name;
    vehicle.createdBy = user;

    const savedVehicle = await this.vehicleRepository.save(vehicle);

    return this.mapToResponseDto(savedVehicle);
  }

  private mapToResponseDto(vehicle: Vehicle): VehicleResponseDto {
    return {
      id: vehicle.id,
      name: vehicle.name,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }

  async findAll(): Promise<VehicleResponseDto[]> {
    const vehicles = await this.vehicleRepository.find();
    return vehicles.map((vehicle) => this.mapToResponseDto(vehicle));
  }

  async findOne(id: number): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleRepository.findOne({ 
      where: { id },
    });
    if (!vehicle) {
      throw new Error('Fahrzeug nicht gefunden');
    }
    return this.mapToResponseDto(vehicle);
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto): Promise<VehicleResponseDto> {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });
    if (!vehicle) {
      throw new Error('Fahrzeug nicht gefunden');
    }
    await this.vehicleRepository.update(id, { name: updateVehicleDto.name });
    const updatedVehicle = await this.vehicleRepository.findOne({ where: { id } });
    if (!updatedVehicle) {
      throw new Error('Fahrzeug nicht gefunden');
    }
    return this.mapToResponseDto(updatedVehicle);
  }

  async remove(id: number): Promise<void> {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });
    if (!vehicle) {
      throw new Error('Fahrzeug nicht gefunden');
    }
    await this.vehicleRepository.remove(vehicle);
  }
}
