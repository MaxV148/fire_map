import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UserLoginDto } from '../users/dto/user-login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserId } from '../decorators/user-id.decorator';
import { UsersService } from '../users/users.service';
import { RegisterDtoQuery } from './dto/register.dto';
import { SelfResetPasswordDto } from '../users/dto/password.dto';
import { OtpVerifyDto } from '../users/dto/otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: UserLoginDto, @Res() res: Response) {
    const result = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );

    const cookieName = this.configService.get<string>(
      'session.cookieName',
      'sessionId',
    );
    const maxAge = this.configService.get<number>('session.maxAge', 86400000);
    const isProduction = this.configService.get<boolean>(
      'app.isProduction',
      false,
    );

    res.cookie(cookieName, result.sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: maxAge,
    });

    if (result.twoFactorRequired) {
      return res.status(HttpStatus.OK).json({ twoFactorRequired: true });
    }

    return res
      .status(HttpStatus.OK)
      .json({ twoFactorRequired: false, user: result.user });
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async signOut(@Req() req: Request, @Res() res: Response) {
    const cookieName = this.configService.get<string>(
      'session.cookieName',
      'sessionId',
    );
    const sessionId = req.cookies?.[cookieName];

    if (sessionId) {
      await this.authService.signOut(sessionId);
    }

    // Lösche Cookie
    res.clearCookie(cookieName);

    return res.json({ message: 'Logout successful' });
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Query() invite: RegisterDtoQuery,
    @Res() res: Response,
  ) {
    const token = invite.invitation;
    if (!token) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Missing invitation token' });
    }
    const result = await this.authService.register(createUserDto, token);

    const cookieName = this.configService.get<string>(
      'session.cookieName',
      'sessionId',
    );
    const maxAge = this.configService.get<number>('session.maxAge', 86400000);
    const isProduction = this.configService.get<boolean>(
      'app.isProduction',
      false,
    );

    res.cookie(cookieName, result.sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: maxAge,
    });

    return res.status(204).send();
  }

  @HttpCode(HttpStatus.OK)
  @Get('me')
  async getCurrentUser(@UserId() userId: string) {
    const user = await this.usersService.findByIdWithRole(parseInt(userId));

    if (!user) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }

    return this.usersService.toUserResponseDto(user);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('self_reset_password')
  async selfResetPassword(
    @UserId() userId: string,
    @Body() body: SelfResetPasswordDto,
  ) {
    await this.authService.selfResetPassword(
      +userId,
      body.oldPassword,
      body.newPassword,
    );
    return;
  }

  @HttpCode(HttpStatus.OK)
  @Post('2fa/setup')
  async setupTwoFactor(@UserId() userId: string, @Res() res: Response) {
    const png = await this.authService.setupTwoFactor(+userId);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="qr.png"');
    return res.send(png);
  }

  @HttpCode(HttpStatus.OK)
  @Post('2fa/verify')
  async verifyTwoFactor(@UserId() userId: string, @Body() dto: OtpVerifyDto) {
    await this.authService.verifyTwoFactor(+userId, dto.code);
    return { status: 'ok' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('2fa/login-verify')
  async verifyTwoFactorLogin(
    @Req() req: Request,
    @Res() res: Response,
    @Body() dto: OtpVerifyDto,
  ) {
    const cookieName = this.configService.get<string>(
      'session.cookieName',
      'sessionId',
    );
    const sessionId = (req as any).cookies?.[cookieName];
    const result = await this.authService.completeTwoFactorLogin(
      sessionId,
      dto.code,
    );

    const maxAge = this.configService.get<number>('session.maxAge', 86400000);
    const isProduction = this.configService.get<boolean>(
      'app.isProduction',
      false,
    );

    // Setze neue Session-ID als Cookie
    res.cookie(cookieName, result.sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: maxAge,
    });

    return res
      .status(HttpStatus.OK)
      .json({ twoFactorRequired: false, user: result.user });
  }
}
