import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

/**
 * DTO for updating an event
 */
export class UpdateEventDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @IsOptional()
  location?: [number, number]; // [longitude, latitude]

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  tagIds?: number[];

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  vehicleIds?: number[];
}
