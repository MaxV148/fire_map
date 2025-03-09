interface LoginCredentials {
  username: string;
  password: string;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  // Add any other user properties you need
}

interface AuthResponse {
  token: string;
  user: UserProfile;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user_profile';

/**
 * Authentication service for handling login, logout, and token management
 */
export const authService = {
  /**
   * Login with username and password
   * @param credentials - The login credentials
   * @returns Promise with the authentication response
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch('http://localhost:8000/v1/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed. Please check your credentials.');
      }

      const data: AuthResponse = await response.json();
      
      // Store the token and user profile
      localStorage.setItem(TOKEN_KEY, data.token);
      
      // Store user profile if available
      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout the current user
   */
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Optionally, you can also call an API endpoint to invalidate the token on the server
  },

  /**
   * Get the current authentication token
   * @returns The authentication token or null if not authenticated
   */
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Check if the user is authenticated
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get the authentication header for API requests
   * @returns The headers object with the Authorization header
   */
  getAuthHeader: (): Record<string, string> => {
    const token = authService.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  /**
   * Get the current user profile
   * @returns The user profile or null if not available
   */
  getUserProfile: (): UserProfile | null => {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson) as UserProfile;
    } catch (error) {
      console.error('Failed to parse user profile:', error);
      return null;
    }
  }
};

export default authService; 