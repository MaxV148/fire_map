import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

/**
 * DTO for creating a new vehicle type
 */
export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}
