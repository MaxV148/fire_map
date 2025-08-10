import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO for creating a new role
 */
export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  name: string;

  @IsString()
  @MaxLength(250)
  description: string;
}
