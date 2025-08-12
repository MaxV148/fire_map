import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SessionModule } from '../session/session.module';
import { UsersModule } from '../users/users.module';
import { Invite } from '../invites/entities/invite.entity';
import { OtpSettings } from '../otp-settings/entities/otp-setting.entity';

@Module({
  imports: [
    UsersModule,
    SessionModule,
    TypeOrmModule.forFeature([Invite, OtpSettings]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
