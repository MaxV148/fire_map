import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OtpSettingsService } from './otp-settings.service';
import { CreateOtpSettingDto } from './dto/create-otp-setting.dto';
import { UpdateOtpSettingDto } from './dto/update-otp-setting.dto';

@Controller('otp-settings')
export class OtpSettingsController {
  constructor(private readonly otpSettingsService: OtpSettingsService) {}

  @Post()
  create(@Body() createOtpSettingDto: CreateOtpSettingDto) {
    return this.otpSettingsService.create(createOtpSettingDto);
  }

  @Get()
  findAll() {
    return this.otpSettingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.otpSettingsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOtpSettingDto: UpdateOtpSettingDto,
  ) {
    return this.otpSettingsService.update(+id, updateOtpSettingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.otpSettingsService.remove(+id);
  }
}
