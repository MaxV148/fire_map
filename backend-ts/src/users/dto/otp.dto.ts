import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

/**
 * DTO for OTP verification
 */
export class OtpVerifyDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

/**
 * DTO for second step login with OTP
 */
export class LoginStep2Dto {
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

/**
 * DTO for disabling OTP
 */
export class OtpDisableDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsBoolean()
  @IsOptional()
  confirm?: boolean = false;
}

/**
 * DTO for security settings response
 */
export class SecuritySettingsResponseDto {
  otpConfigured: boolean;
}
