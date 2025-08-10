import { Module } from '@nestjs/common';
import { OtpSettingsService } from './otp-settings.service';
import { OtpSettingsController } from './otp-settings.controller';

@Module({
  controllers: [OtpSettingsController],
  providers: [OtpSettingsService],
})
export class OtpSettingsModule {}
