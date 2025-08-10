import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO for updating a vehicle type
 */
export class UpdateVehicleDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;
}
