import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsInt,
} from 'class-validator';

/**
 * DTO for password reset by admin
 */
export class ResetPasswordDto {
  @IsInt()
  userId: number;
}

/**
 * DTO for setting new password
 */
export class SetNewPasswordDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty()
  newPassword: string;
}

/**
 * DTO for self password reset
 */
export class SelfResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty()
  newPassword: string;
}

/**
 * DTO for forgot password request
 */
export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

/**
 * DTO for confirming forgot password
 */
export class ConfirmForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty()
  newPassword: string;
}
