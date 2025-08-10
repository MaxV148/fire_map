import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { Role } from './entities/role.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createRoleDto: CreateRoleDto, userId: number): Promise<RoleResponseDto> {
    // Prüfe ob der User existiert
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    
    if (!user) {
      throw new Error('Benutzer nicht gefunden');
    }

    const role = new Role();
    role.name = createRoleDto.name;
    role.description = createRoleDto.description;

    const savedRole = await this.roleRepository.save(role);

    return this.mapToResponseDto(savedRole);
  }

  private mapToResponseDto(role: Role): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.roleRepository.find();
    return roles.map((role) => this.mapToResponseDto(role));
  }

  async findOne(id: number): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({ 
      where: { id },
    });
    if (!role) {
      throw new Error('Rolle nicht gefunden');
    }
    return this.mapToResponseDto(role);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new Error('Rolle nicht gefunden');
    }
    
    const updateData: any = {};
    if (updateRoleDto.name) updateData.name = updateRoleDto.name;
    if (updateRoleDto.description !== undefined) updateData.description = updateRoleDto.description;
    
    await this.roleRepository.update(id, updateData);
    const updatedRole = await this.roleRepository.findOne({ where: { id } });
    if (!updatedRole) {
      throw new Error('Rolle nicht gefunden');
    }
    return this.mapToResponseDto(updatedRole);
  }

  async remove(id: number): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new Error('Rolle nicht gefunden');
    }
    await this.roleRepository.remove(role);
  }
}
