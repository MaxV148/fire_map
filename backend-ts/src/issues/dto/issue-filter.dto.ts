import {
  IsOptional,
  IsArray,
  IsNumber,
  IsString,
  IsDateString,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IssueResponseDto } from './issue-response.dto';

/**
 * DTO for filtering issues
 */
export class IssueFilterDto {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  tagIds?: number[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

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

/**
 * DTO for paginated issue response
 */
export class PaginatedIssueResponseDto {
  issues: IssueResponseDto[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}
