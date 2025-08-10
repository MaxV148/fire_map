import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO for updating a tag
 */
export class UpdateTagDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;
}
