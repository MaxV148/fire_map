import { IsEmail, IsOptional, IsInt, Min, Max } from 'class-validator';

/**
 * DTO for creating a new invite
 */
export class CreateInviteDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  expireDays?: number = 7;
}
