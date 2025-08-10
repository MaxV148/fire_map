import { Injectable } from '@nestjs/common';
import { CreateOtpSettingDto } from './dto/create-otp-setting.dto';
import { UpdateOtpSettingDto } from './dto/update-otp-setting.dto';

@Injectable()
export class OtpSettingsService {
  create(createOtpSettingDto: CreateOtpSettingDto) {
    return 'This action adds a new otpSetting';
  }

  findAll() {
    return `This action returns all otpSettings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} otpSetting`;
  }

  update(id: number, updateOtpSettingDto: UpdateOtpSettingDto) {
    return `This action updates a #${id} otpSetting`;
  }

  remove(id: number) {
    return `This action removes a #${id} otpSetting`;
  }
}
