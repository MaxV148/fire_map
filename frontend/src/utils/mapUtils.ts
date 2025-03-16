import { Location } from '../components/LocationMap';
import { Event } from '../services/eventService';
import { Issue } from '../services/issueService';

/**
 * Convert an event to a location object for the map
 * @param event - The event to convert
 * @returns A location object for the map
 */
export const eventToLocation = (event: Event): Location => {
  // Check if location is available
  if (!event.location || event.location.length < 2) {
    // Fallback to default location (San Francisco)
    return {
      id: `event-${event.id}`,
      position: [37.7749, -122.4194] as [number, number],
      name: event.name || 'Unnamed Event',
      description: event.description || 'No description provided',
    };
  }

  // Convert from [longitude, latitude] to [latitude, longitude] format
  const position: [number, number] = [event.location[1], event.location[0]];

  return {
    id: `event-${event.id}`,
    position,
    name: event.name,
    description: event.description || 'No description provided',
  };
};

/**
 * Convert an array of events to an array of locations for the map
 * @param events - The events to convert
 * @returns An array of locations for the map
 */
export const eventsToLocations = (events: Event[]): Location[] => {
  return events.filter(event => event.location).map(eventToLocation);
};

/**
 * Convert an issue to a location object for the map
 * This is a placeholder function since issues typically don't have locations
 * but could be extended in the future to support locations
 * @param issue - The issue to convert
 * @returns null since issues don't have locations
 */
export const issueToLocation = (issue: Issue): Location | null => {
  // Issues typically don't have locations in the current model
  // This is a placeholder for future extension
  return null;
};

/**
 * Get the map center based on locations or default to San Francisco
 * @param locations - The locations to center on
 * @returns The center coordinates [latitude, longitude]
 */
export const getMapCenter = (locations: Location[]): [number, number] => {
  if (locations.length === 0) {
    // Default to San Francisco if no locations
    return [37.7749, -122.4194];
  }

  // Calculate the average lat/lng from all locations
  const totalLat = locations.reduce((sum, loc) => {
    const [lat] = Array.isArray(loc.position) 
      ? loc.position 
      : [loc.position.lat, loc.position.lng];
    return sum + lat;
  }, 0);

  const totalLng = locations.reduce((sum, loc) => {
    const [, lng] = Array.isArray(loc.position) 
      ? loc.position 
      : [loc.position.lat, loc.position.lng];
    return sum + lng;
  }, 0);

  return [
    totalLat / locations.length,
    totalLng / locations.length
  ];
}; 