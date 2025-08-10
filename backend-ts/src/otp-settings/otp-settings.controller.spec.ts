import { Test, TestingModule } from '@nestjs/testing';
import { OtpSettingsController } from './otp-settings.controller';
import { OtpSettingsService } from './otp-settings.service';

describe('OtpSettingsController', () => {
  let controller: OtpSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpSettingsController],
      providers: [OtpSettingsService],
    }).compile();

    controller = module.get<OtpSettingsController>(OtpSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
