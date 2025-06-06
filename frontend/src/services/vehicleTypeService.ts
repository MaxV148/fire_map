import authService from './authService';

const API_BASE_URL = "http://localhost:8000/v1";

// Types
export interface VehicleTypeCreate {
  name: string;
  description?: string;
  capacity?: number;
}

export interface VehicleTypeUpdate {
  name?: string;
  description?: string;
  capacity?: number;
}

export interface VehicleType {
  id: number;
  name: string;
  description: string;
  capacity: number;
  created_at: string;
}

// Setup auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Generic function to handle API responses and errors
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Try to get error details from the response
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || `Error: ${response.status}`;
    } catch {
      errorMessage = `Error: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  
  // For 204 No Content responses
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

/**
 * Create a new vehicle type
 */
export const createVehicleType = async (vehicleData: VehicleTypeCreate): Promise<VehicleType> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(vehicleData)
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating vehicle type:', error);
    throw error;
  }
};

/**
 * Get all vehicle types
 */
export const getAllVehicleTypes = async (): Promise<VehicleType[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicle`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching vehicle types:', error);
    throw error;
  }
};

/**
 * Delete a vehicle type
 */
export const deleteVehicleType = async (vehicleId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicle/${vehicleId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting vehicle type:', error);
    throw error;
  }
};

export default {
  getAllVehicleTypes,
  deleteVehicleType,
}; 