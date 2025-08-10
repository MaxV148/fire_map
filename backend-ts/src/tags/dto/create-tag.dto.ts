import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

/**
 * DTO for creating a new tag
 */
export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}
