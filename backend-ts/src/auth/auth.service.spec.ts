import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SessionService } from '../session/session.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Invite } from '../invites/entities/invite.entity';
import { OtpSettings } from '../otp-settings/entities/otp-setting.entity';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const usersServiceMock = {
      findByEmailWithRole: jest.fn(),
      findByIdWithRole: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      toUserResponseDto: jest.fn((u: any) => u),
      updatePassword: jest.fn(),
    };

    const sessionServiceMock = {
      generateSecureSessionId: jest.fn(() => 'test-session'),
      createSession: jest.fn(),
      deleteSession: jest.fn(),
      getSession: jest.fn(),
    };

    const configServiceMock = {
      get: jest.fn(() => 86400),
    };

    const repoMock = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((x: any) => x),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: getRepositoryToken(Invite), useValue: repoMock },
        { provide: getRepositoryToken(OtpSettings), useValue: repoMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
