import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

/**
 * DTO for creating a new user
 */
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty()
  password: string;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  lastName: string;
}
