import { IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class SessionDto {
  @IsString()
  userId: string;

  @IsString()
  role: string;

  @IsDateString()
  createdAt: string;

  @IsOptional()
  @IsBoolean()
  twoFactorPending?: boolean;

  constructor(userId: string, role: string, createdAt?: string, twoFactorPending?: boolean) {
    this.userId = userId;
    this.role = role;
    this.createdAt = createdAt || new Date().toISOString();
    this.twoFactorPending = twoFactorPending;
  }
}
