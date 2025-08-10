import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedUserResponseDto, UserResponseDto } from './dto/user-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserFilterDto } from './dto/user-filter.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Creates a new user with hashed password and assigns default 'user' role.
   * @param createUserDto User data for creation
   * @returns Promise resolving to the created user as UserResponseDto
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    // Finde die Standard "user" Rolle
    const userRole = await this.roleRepository.findOne({
      where: { name: 'user' },
    });

    if (!userRole) {
      throw new Error(
        'Default user role not found. Please ensure database seeding has been completed.',
      );
    }

    const user = this.userRepository.create({
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      password: hashedPassword,
      roleId: userRole.id,
    });

    const savedUser = await this.userRepository.save(user);

    // Lade den User mit der Rolle für die Response
    const userWithRole = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['role'],
    });

    return this.toUserResponseDto(userWithRole!);
  }

  async findAll(filter?: UserFilterDto): Promise<PaginatedUserResponseDto> {
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 10;

    const [users, totalCount] = await this.userRepository.findAndCount({
      relations: ['role'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      users: users.map((u) => this.toUserResponseDto(u)),
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  /**
   * Finds a user by their email address.
   * @param email The email address to search for
   * @returns Promise resolving to the user or null if not found
   */
  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Finds a user by their email address with role relationship loaded.
   * @param email The email address to search for
   * @returns Promise resolving to the user with role or null if not found
   */
  findByEmailWithRole(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  /**
   * Finds a user by their ID with role relationship loaded.
   * @param id The user ID to search for
   * @returns Promise resolving to the user with role or null if not found
   */
  findByIdWithRole(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  /**
   * Converts a User entity to UserResponseDto, excluding sensitive data.
   * @param user User entity with role relationship loaded
   * @returns UserResponseDto with role name instead of roleId
   */
  toUserResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      role: user.role?.name || 'user',
      deactivated: user.deactivated,
    };
  }
}
