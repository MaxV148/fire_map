import authService from './authService';

const API_BASE_URL = "http://localhost:8000/v1";

// Types
export interface TagCreate {
  name: string;
  color?: string;
  description?: string;
}

export interface TagUpdate {
  name?: string;
  color?: string;
  description?: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  description: string;
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
 * Create a new tag
 */
export const createTag = async (tagData: TagCreate): Promise<Tag> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tag`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tagData)
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
};

/**
 * Get all tags
 */
export const getAllTags = async (): Promise<Tag[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tag`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

/**
 * Delete a tag
 */
export const deleteTag = async (tagId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tag/${tagId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};

/**
 * Get a tag by ID
 * @param tagId - The tag ID
 * @returns Promise with the tag
 */
export const getTagById = async (tagId: number): Promise<Tag | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tag/${tagId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching tag ${tagId}:`, error);
    return null;
  }
};

export default {
  getAllTags,
  getTagById,
  createTag,
  deleteTag,
}; 