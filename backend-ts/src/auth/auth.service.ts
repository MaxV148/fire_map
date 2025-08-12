import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { SessionService } from '../session/session.service';
import { SessionDto } from '../session/dto/session.dto';
import * as bcrypt from 'bcrypt';
import SignUtils from '../common/sign';
import { Invite } from '../invites/entities/invite.entity';
import { OtpSettings } from '../otp-settings/entities/otp-setting.entity';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private sessionService: SessionService,
    private configService: ConfigService,
    @InjectRepository(Invite)
    private readonly inviteRepository: Repository<Invite>,
    @InjectRepository(OtpSettings)
    private readonly otpSettingsRepository: Repository<OtpSettings>,
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
  ): Promise<{
    sessionId: string;
    user?: UserResponseDto;
    twoFactorRequired?: boolean;
  }> {
    const user = await this.usersService.findByEmailWithRole(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Prüfe 2FA Konfiguration
    const otpSettings = await this.otpSettingsRepository.findOne({
      where: { userId: user.id },
    });

    const sessionId = this.sessionService.generateSecureSessionId();
    const maxAgeSeconds = this.configService.get<number>(
      'session.maxAgeSeconds',
      86400,
    );

    if (otpSettings?.otpConfigured === true) {
      // Erzeuge TEMP Session mit 2FA-Pending-Flag
      const tempSession = new SessionDto(
        user.id.toString(),
        user.role?.name || 'user',
        undefined,
        true,
      );
      await this.sessionService.createSession(
        sessionId,
        maxAgeSeconds,
        tempSession,
      );
      return { sessionId, twoFactorRequired: true };
    }

    // Normale Session falls keine 2FA
    const sessionData = new SessionDto(
      user.id.toString(),
      user.role?.name || 'user',
    );
    await this.sessionService.createSession(
      sessionId,
      maxAgeSeconds,
      sessionData,
    );
    return { sessionId, user: this.usersService.toUserResponseDto(user) };
  }

  /**
   * Logs out a user by deleting their session.
   * @param sessionId Session ID to invalidate
   */
  async signOut(sessionId: string): Promise<void> {
    await this.sessionService.deleteSession(sessionId);
  }

  /**
   * Allows a logged-in user to change their own password by verifying the old password.
   */
  async selfResetPassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersService.findByIdWithRole(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await this.usersService.updatePassword(user.id, hashedPassword);
  }

  /**
   * Prepares Two-Factor Authentication for a user by generating a secret and returning a QR code PNG.
   * If settings already exist, the secret is rotated and configuration is reset to false.
   */
  async setupTwoFactor(userId: number): Promise<Buffer> {
    const user = await this.usersService.findByIdWithRole(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    const existing = await this.otpSettingsRepository.findOne({
      where: { userId },
    });
    if (existing?.otpConfigured) {
      throw new BadRequestException('2FA is already configured for this user');
    }

    const secret: string = authenticator.generateSecret();

    if (existing) {
      existing.secret = secret;
      existing.otpConfigured = false;
      await this.otpSettingsRepository.save(existing);
    } else {
      const settings = this.otpSettingsRepository.create({
        userId,
        secret,
        otpConfigured: false,
      });
      await this.otpSettingsRepository.save(settings);
    }

    const issuer: string = 'Fire Map';
    const otpauthUrl: string = authenticator.keyuri(user.email, issuer, secret);
    const pngBuffer: Buffer = await QRCode.toBuffer(otpauthUrl, {
      type: 'png',
    });
    return pngBuffer;
  }

  /**
   * Verifies the provided OTP code for a user's 2FA setup and enables 2FA on success.
   */
  async verifyTwoFactor(userId: number, code: string): Promise<void> {
    const settings = await this.otpSettingsRepository.findOne({
      where: { userId },
    });
    if (!settings || !settings.secret) {
      throw new BadRequestException('2FA setup not started for this user');
    }
    const isValid: boolean = authenticator.verify({
      token: code,
      secret: settings.secret,
    });
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP code');
    }
    settings.otpConfigured = true;
    await this.otpSettingsRepository.save(settings);
  }

  /**
   * Verifiziert die 2FA im Login-Fluss, hebt die temporäre Session auf eine volle Session an.
   */
  async completeTwoFactorLogin(
    sessionId: string,
    code: string,
  ): Promise<{ sessionId: string; user: UserResponseDto }> {
    const session = await this.sessionService.getSession(sessionId);
    if (!session || session.twoFactorPending !== true) {
      throw new UnauthorizedException(
        'No pending two-factor authentication for this session',
      );
    }

    const userId = parseInt(session.userId, 10);
    const user = await this.usersService.findByIdWithRole(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    const settings = await this.otpSettingsRepository.findOne({
      where: { userId },
    });
    if (!settings || !settings.secret || settings.otpConfigured !== true) {
      throw new BadRequestException('Two-factor authentication not configured');
    }

    const isValid: boolean = authenticator.verify({
      token: code,
      secret: settings.secret,
    });
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    // Alte (temporäre) Session entfernen und neue Session-ID ausstellen
    await this.sessionService.deleteSession(sessionId);
    const newSessionId = this.sessionService.generateSecureSessionId();
    const maxAgeSeconds = this.configService.get<number>(
      'session.maxAgeSeconds',
      86400,
    );
    const fullSession = new SessionDto(session.userId, session.role);
    await this.sessionService.createSession(
      newSessionId,
      maxAgeSeconds,
      fullSession,
    );

    return {
      sessionId: newSessionId,
      user: this.usersService.toUserResponseDto(user),
    };
  }

  /**
   * Registers a new user in the system.
   * @param createUserDto User registration data
   * @returns Promise resolving to the created user without sensitive data
   * @throws ConflictException if email already exists
   */
  async register(
    createUserDto: CreateUserDto,
    invite_token: string,
  ): Promise<{ sessionId: string; user: UserResponseDto }> {
    const secret = process.env.HMAC_SECRET ?? 'dev-secret';
    const { isValid, inviteUuid } = SignUtils.verifySignedToken(
      invite_token,
      secret,
    );
    if (!isValid || !inviteUuid) {
      throw new UnauthorizedException('Invalid or missing invitation token');
    }

    // Validate invitation entry against DB state
    const invite = await this.inviteRepository.findOne({
      where: { inviteUuid },
    });
    if (!invite) {
      throw new UnauthorizedException('Invitation not found');
    }
    if (invite.isUsed) {
      throw new UnauthorizedException('Invitation already used');
    }
    if (new Date(invite.expireDate).getTime() < Date.now()) {
      throw new UnauthorizedException('Invitation expired');
    }
    if (invite.email.toLowerCase() !== createUserDto.email.toLowerCase()) {
      throw new UnauthorizedException('Invitation email does not match');
    }
    // Check if user with this email already exists
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user using the users service
    const created = await this.usersService.create(createUserDto);

    // Mark invitation as used
    invite.isUsed = true;
    await this.inviteRepository.save(invite);

    // Create session for the newly registered user (same as login)
    const sessionId = this.sessionService.generateSecureSessionId();
    const sessionData = new SessionDto(created.id.toString(), created.role);
    const maxAgeSeconds = this.configService.get<number>(
      'session.maxAgeSeconds',
      86400,
    );
    await this.sessionService.createSession(
      sessionId,
      maxAgeSeconds,
      sessionData,
    );

    return { sessionId, user: created };
  }
}
