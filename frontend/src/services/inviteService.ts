import authService from './authService';

const API_BASE_URL = "http://localhost:8000/v1";
// Types
export interface InviteCreate {
  email: string;
  expire_days?: number;
}

export interface Invite {
  id: number;
  invite_uuid: string;
  email: string;
  expire_date: string;
  created_at: string;
  is_used: boolean;
}

export interface InviteList {
  invites: Invite[];
  count: number;
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
 * Create a new invitation for a user
 */
export const createInvite = async (inviteData: InviteCreate): Promise<Invite> => {
  try {
    const response = await fetch(`${API_BASE_URL}/invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(inviteData)
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating invite:', error);
    throw error;
  }
};

/**
 * Get all invitations
 */
export const getAllInvites = async (skip = 0, limit = 100): Promise<InviteList> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/invite?skip=${skip}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching invites:', error);
    throw error;
  }
};

/**
 * Delete an invitation
 */
export const deleteInvite = async (inviteUuid: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/invite/${inviteUuid}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting invite:', error);
    throw error;
  }
}; 