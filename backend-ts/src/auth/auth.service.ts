import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { User } from '../users/entities/user.entity';
import { SessionService } from '../session/session.service';
import { SessionDto } from '../session/dto/session.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private sessionService: SessionService,
    private configService: ConfigService,
  ) {}

  /**
   * Authenticates a user with email and password.
   * @param email User's email address
   * @param pass Plain text password
   * @returns Authentication result with session ID and safe user data
   * @throws UnauthorizedException if credentials are invalid
   */
  async signIn(
    email: string,
    pass: string,
  ): Promise<{ sessionId: string; user: UserResponseDto }> {
    const user = await this.usersService.findByEmailWithRole(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generiere sichere Session-ID
    const sessionId = this.sessionService.generateSecureSessionId();

    // Erstelle Session-Daten
    const sessionData = new SessionDto(
      user.id.toString(),
      user.role?.name || 'user', // Fallback falls keine Rolle vorhanden
    );

    // Speichere Session in Redis mit konfigurierter Laufzeit
    const maxAgeSeconds = this.configService.get<number>(
      'session.maxAgeSeconds',
      86400,
    );
    await this.sessionService.createSession(
      sessionId,
      maxAgeSeconds,
      sessionData,
    );

    return {
      sessionId,
      user: this.usersService.toUserResponseDto(user),
    };
  }

  /**
   * Logs out a user by deleting their session.
   * @param sessionId Session ID to invalidate
   */
  async signOut(sessionId: string): Promise<void> {
    await this.sessionService.deleteSession(sessionId);
  }

  /**
   * Registers a new user in the system.
   * @param createUserDto User registration data
   * @returns Promise resolving to the created user without sensitive data
   * @throws ConflictException if email already exists
   */
  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user with this email already exists
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user using the users service
    return this.usersService.create(createUserDto);
  }
}
