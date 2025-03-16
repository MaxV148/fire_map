import authService from './authService';

export interface Event {
  id: number;
  name: string;
  description: string;
  location: number[]; // [longitude, latitude]
  tag_id: number;
  vehicle_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

// Interface for event updates
export interface EventUpdate {
  name?: string;
  description?: string;
  location?: number[];
  tag_id?: number;
  vehicle_id?: number;
}

const API_URL = 'http://localhost:8000/v1/event';

/**
 * Fetch all events
 * @returns Promise with array of events
 */
export const getAllEvents = async (): Promise<Event[]> => {
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
      throw new Error('Failed to fetch events');
    }

    const data: Event[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

/**
 * Fetch events for a specific user
 * @param userId - The user ID
 * @returns Promise with array of events
 */
export const getEventsByUser = async (userId: number): Promise<Event[]> => {
  try {
    const response = await fetch(`${API_URL}/user/${userId}`, {
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
      throw new Error(`Failed to fetch events for user ${userId}`);
    }

    const data: Event[] = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching events for user ${userId}:`, error);
    return [];
  }
};

/**
 * Get an event by ID
 * @param eventId - The event ID
 * @returns Promise with the event
 */
export const getEventById = async (eventId: number): Promise<Event | null> => {
  try {
    const response = await fetch(`${API_URL}/${eventId}`, {
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
      throw new Error(`Failed to fetch event ${eventId}`);
    }

    const data: Event = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    return null;
  }
};

/**
 * Fetch events with a specific tag
 * @param tagId - The tag ID
 * @returns Promise with array of events
 */
export const getEventsByTag = async (tagId: number): Promise<Event[]> => {
  try {
    const response = await fetch(`${API_URL}/tag/${tagId}`, {
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
      throw new Error(`Failed to fetch events for tag ${tagId}`);
    }

    const data: Event[] = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching events for tag ${tagId}:`, error);
    return [];
  }
};

/**
 * Fetch events with a specific vehicle type
 * @param vehicleId - The vehicle type ID
 * @returns Promise with array of events
 */
export const getEventsByVehicle = async (vehicleId: number): Promise<Event[]> => {
  try {
    const response = await fetch(`${API_URL}/vehicle/${vehicleId}`, {
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
      throw new Error(`Failed to fetch events for vehicle ${vehicleId}`);
    }

    const data: Event[] = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching events for vehicle ${vehicleId}:`, error);
    return [];
  }
};

/**
 * Filter events by time period
 * @param events - Array of events to filter
 * @param period - Time period to filter by ('today', 'week', 'month', or null for all)
 * @returns Filtered array of events
 */
export const filterEventsByTime = (events: Event[], period: 'today' | 'week' | 'month' | null): Event[] => {
  if (!period || !events.length) return events;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return events.filter(event => {
    const eventDate = new Date(event.created_at);
    
    switch (period) {
      case 'today':
        return eventDate >= today;
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return eventDate >= weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return eventDate >= monthAgo;
      }
      default:
        return true;
    }
  });
};

/**
 * Delete an event by ID
 * @param eventId - The event ID to delete
 * @returns Promise with success status
 */
export const deleteEvent = async (eventId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    if (response.status === 401) {
      // Handle unauthorized (expired token)
      authService.handleUnauthorized();
      return false;
    }

    if (!response.ok) {
      throw new Error(`Failed to delete event ${eventId}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting event ${eventId}:`, error);
    return false;
  }
};

/**
 * Update an event
 * @param eventId - The event ID to update
 * @param eventData - The updated event data
 * @returns Promise with success status
 */
export const updateEvent = async (eventId: number, eventData: Partial<EventUpdate>): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
      body: JSON.stringify(eventData),
    });

    if (response.status === 401) {
      // Handle unauthorized (expired token)
      authService.handleUnauthorized();
      return false;
    }

    if (!response.ok) {
      throw new Error(`Failed to update event ${eventId}`);
    }

    return true;
  } catch (error) {
    console.error(`Error updating event ${eventId}:`, error);
    return false;
  }
};

export default {
  getAllEvents,
  getEventsByUser,
  getEventById,
  getEventsByTag,
  getEventsByVehicle,
  filterEventsByTime,
  deleteEvent,
  updateEvent,
}; 