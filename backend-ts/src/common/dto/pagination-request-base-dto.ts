import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Base DTO for pagination request parameters
 */
export class PaginationRequestDto {
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
