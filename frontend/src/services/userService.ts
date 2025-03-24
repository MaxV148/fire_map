import authService from './authService';

export interface User {
  id: number;
  username: string;
  created_at: string;
  otp_configured: boolean;
  role?: {
    id: number;
    name: string;
  };
}

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch('http://localhost:8000/v1/user/all', {
      headers: authService.getAuthHeader()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}; 