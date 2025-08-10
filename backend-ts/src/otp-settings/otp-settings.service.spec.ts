import { Test, TestingModule } from '@nestjs/testing';
import { OtpSettingsService } from './otp-settings.service';

describe('OtpSettingsService', () => {
  let service: OtpSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpSettingsService],
    }).compile();

    service = module.get<OtpSettingsService>(OtpSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
