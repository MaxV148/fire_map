import authService from './authService';

export interface VehicleType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

const API_URL = 'http://localhost:8000/v1/vehicle';

/**
 * Fetch all vehicle types
 * @returns Promise with array of vehicle types
 */
export const getAllVehicleTypes = async (): Promise<VehicleType[]> => {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (response.status === 401) {
      // Handle unauthorized (expired token)
      authService.handleUnauthorized();
      return [];
    }

    if (!response.ok) {
      throw new Error('Failed to fetch vehicle types');
    }

    const data: VehicleType[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching vehicle types:', error);
    return [];
  }
};

/**
 * Get a vehicle type by ID
 * @param vehicleTypeId - The vehicle type ID
 * @returns Promise with the vehicle type
 */
export const getVehicleTypeById = async (vehicleTypeId: number): Promise<VehicleType | null> => {
  try {
    const response = await fetch(`${API_URL}/${vehicleTypeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (response.status === 401) {
      // Handle unauthorized (expired token)
      authService.handleUnauthorized();
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch vehicle type ${vehicleTypeId}`);
    }

    const data: VehicleType = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching vehicle type ${vehicleTypeId}:`, error);
    return null;
  }
};

export default {
  getAllVehicleTypes,
  getVehicleTypeById,
}; 