import { IsEmail, IsOptional, IsString } from 'class-validator';

/**
 * DTO for invite response
 */
export class InviteResponseDto {
  id: number;
  inviteUuid: string;
  email: string;
  expireDate: Date;
  createdAt: Date;
  isUsed: boolean;
}

/**
 * DTO for invite list response
 */
export class InviteListDto {
  invites: InviteResponseDto[];
  count: number;
}

/**
 * DTO for test email request
 */
export class TestEmailRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  subject?: string = 'Test Email';

  @IsString()
  @IsOptional()
  body?: string = 'Dies ist eine Test-Email vom System';
}
