import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  ArrayMinSize,
  ArrayMaxSize,
  IsOptional,
} from 'class-validator';

/**
 * DTO for creating a new event
 */
export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  location: [number, number]; // [longitude, latitude]

  @IsArray()
  @IsNumber({}, { each: true })
  tagIds: number[];

  @IsArray()
  @IsNumber({}, { each: true })
  vehicleIds: number[];
}
