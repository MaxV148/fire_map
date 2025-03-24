interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserProfile {
  id: number;
  username: string;
}

interface AuthResponse {
  access_token: string;
  id: number;
  username: string;
  token_type: string;
  requires_2fa?: boolean;
  temp_token?: string;
}

export interface OTPVerification {
  temp_token: string;
  code: string;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user_profile';
const IDLE_TIMEOUT_KEY = 'idle_timeout';

// Default idle timeout in milliseconds (15 minutes)
const DEFAULT_IDLE_TIMEOUT = 15 * 60 * 1000;

/**
 * Authentication service for handling login, logout, and token management
 */
export const authService = {
  // Idle timer properties
  idleTimer: null as number | null,
  idleTimeout: DEFAULT_IDLE_TIMEOUT,
  redirectCallback: null as (() => void) | null,

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
      }else{
        window.console.log(response);
      }

      const data: AuthResponse = await response.json();
      
      // Store the token and user profile
      localStorage.setItem(TOKEN_KEY, data.access_token);
      
      if (data.username) {
        const profile: UserProfile = {
          username: data.username,
          id: data.id
        }
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
      }
      
      // Start idle timeout tracking
      authService.startIdleTimer();
      
      return data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  /**
   * Logout the current user
   */
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Clear idle timer
    authService.stopIdleTimer();
    
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
  },

  /**
   * Handle unauthorized response (401) by logging out and redirecting to login
   */
  handleUnauthorized: (): void => {
    authService.logout();
    
    // If a redirect callback is set, call it
    if (authService.redirectCallback) {
      authService.redirectCallback();
    } else {
      // Otherwise, force a page reload which will redirect to login
      window.location.reload();
    }
  },

  /**
   * Set up a callback function for redirecting on token expiration
   * @param callback - The function to call for redirection
   */
  setRedirectCallback: (callback: () => void): void => {
    authService.redirectCallback = callback;
  },

  /**
   * Start the idle timer to track user inactivity
   */
  startIdleTimer: (): void => {
    // Clear any existing timer
    authService.stopIdleTimer();
    
    // Set up user activity listeners
    document.addEventListener('mousemove', authService.resetIdleTimer);
    document.addEventListener('mousedown', authService.resetIdleTimer);
    document.addEventListener('keypress', authService.resetIdleTimer);
    document.addEventListener('touchstart', authService.resetIdleTimer);
    document.addEventListener('scroll', authService.resetIdleTimer);
    
    // Start the initial timer
    authService.resetIdleTimer();
  },
  
  /**
   * Stop the idle timer and remove event listeners
   */
  stopIdleTimer: (): void => {
    if (authService.idleTimer) {
      clearTimeout(authService.idleTimer);
      authService.idleTimer = null;
    }
    
    // Remove event listeners
    document.removeEventListener('mousemove', authService.resetIdleTimer);
    document.removeEventListener('mousedown', authService.resetIdleTimer);
    document.removeEventListener('keypress', authService.resetIdleTimer);
    document.removeEventListener('touchstart', authService.resetIdleTimer);
    document.removeEventListener('scroll', authService.resetIdleTimer);
  },
  
  /**
   * Reset the idle timer when user activity is detected
   */
  resetIdleTimer: (): void => {
    // Only reset if user is authenticated
    if (!authService.isAuthenticated()) return;
    
    // Clear existing timer
    if (authService.idleTimer) {
      clearTimeout(authService.idleTimer);
    }
    
    // Set new timer
    authService.idleTimer = setTimeout(() => {
      console.log('User inactive - logging out due to inactivity');
      authService.handleUnauthorized();
    }, authService.idleTimeout);
  },
  
  /**
   * Configure the idle timeout duration
   * @param timeoutMs - Timeout duration in milliseconds
   */
  setIdleTimeout: (timeoutMs: number): void => {
    authService.idleTimeout = timeoutMs;
    // Reset the timer with new timeout
    if (authService.isAuthenticated()) {
      authService.resetIdleTimer();
    }
  },

  /**
   * Check if 2FA is enabled for the current user
   * @returns Promise<boolean> True if 2FA is enabled
   */
  check2FAStatus: async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/v1/user/me', {
        headers: authService.getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      return data.otp_configured || false;
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    }
  },

  /**
   * Verify OTP code for 2FA login
   * @param verification - The OTP verification data
   * @returns Promise with the authentication response
   */
  verifyOTP: async (verification: OTPVerification): Promise<AuthResponse> => {
    try {
      const response = await fetch('http://localhost:8000/v1/user/login/2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verification),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'OTP-Verifizierung fehlgeschlagen');
      }

      const data: AuthResponse = await response.json();
      
      // Speichere Token und Benutzerprofil
      localStorage.setItem(TOKEN_KEY, data.access_token);
      
      if (data.username) {
        const profile: UserProfile = {
          username: data.username,
          id: data.id
        }
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
      }
      
      // Starte Idle-Timer
      authService.startIdleTimer();
      
      return data;
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

export default authService; 