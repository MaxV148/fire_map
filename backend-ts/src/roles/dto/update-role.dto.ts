import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO for updating a role
 */
export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  @MaxLength(20)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(250)
  description?: string;
}
