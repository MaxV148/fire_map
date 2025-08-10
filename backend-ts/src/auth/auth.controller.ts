import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  NotFoundException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UserLoginDto } from '../users/dto/user-login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserId } from '../decorators/user-id.decorator';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
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
      sameSite: 'strict', // CSRF-Schutz
      maxAge: maxAge,
    });

    return res.status(204).send();
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

  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
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
}
