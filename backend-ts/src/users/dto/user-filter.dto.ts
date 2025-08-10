import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for users pagination query
 */
export class UserFilterDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}
