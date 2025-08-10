import {
  IsOptional,
  IsArray,
  IsNumber,
  IsString,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EventResponseDto } from './event-response.dto';
import { PaginationRequestDto } from '../../common/dto/pagination-request-base-dto';

/**
 * DTO for filtering events
 */
export class EventFilterDto extends PaginationRequestDto {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  vehicleIds?: number[];

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
  @IsString()
  cityName?: string;

  @IsOptional()
  @IsNumber()
  distanceKm?: number;
}

/**
 * DTO for paginated event response
 */
export class PaginatedEventResponseDto {
  events: EventResponseDto[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}
