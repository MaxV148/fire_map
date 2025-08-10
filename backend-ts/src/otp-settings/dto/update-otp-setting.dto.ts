import { PartialType } from '@nestjs/mapped-types';
import { CreateOtpSettingDto } from './create-otp-setting.dto';

export class UpdateOtpSettingDto extends PartialType(CreateOtpSettingDto) {}
