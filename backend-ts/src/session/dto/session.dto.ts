import { IsString, IsDateString } from 'class-validator';

export class SessionDto {
  @IsString()
  userId: string;

  @IsString()
  role: string;

  @IsDateString()
  createdAt: string;

  constructor(userId: string, role: string, createdAt?: string) {
    this.userId = userId;
    this.role = role;
    this.createdAt = createdAt || new Date().toISOString();
  }
}
