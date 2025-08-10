import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SessionModule } from '../session/session.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, SessionModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
