import { PaginationResponse } from '../../common/dto/pagination-response-base-dto';

/**
 * DTO for tag response in events
 */
export class TagResponseDto {
  id: number;
  name: string;
}

/**
 * DTO for vehicle type response in events
 */
export class VehicleTypeResponseDto {
  id: number;
  name: string;
}

/**
 * DTO for event response
 */
export class EventResponseDto {
  id: number;
  name: string;
  description?: string;
  location?: [number, number]; // [longitude, latitude]
  tags: TagResponseDto[];
  vehicles: VehicleTypeResponseDto[];
  createdBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
}

export type PaginatedEvents = PaginationResponse<EventResponseDto>;
