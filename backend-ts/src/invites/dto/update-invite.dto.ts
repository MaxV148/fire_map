import { IsEmail, IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO for updating an invite
 */
export class UpdateInviteDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  isUsed?: boolean;
}
