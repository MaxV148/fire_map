interface SearchResult {
  id: string | number;
  name: string;
  address: string;
  coordinates: [number, number]; // [latitude, longitude]
}

// Mock data for demonstration purposes
const mockLocations: SearchResult[] = [
  {
    id: 1,
    name: "San Francisco City Hall",
    address: "1 Dr Carlton B Goodlett Pl, San Francisco, CA 94102",
    coordinates: [37.7792, -122.4191]
  },
  {
    id: 2,
    name: "Golden Gate Park",
    address: "501 Stanyan St, San Francisco, CA 94117",
    coordinates: [37.7694, -122.4862]
  },
  {
    id: 3,
    name: "Ferry Building",
    address: "1 Ferry Building, San Francisco, CA 94111",
    coordinates: [37.7955, -122.3937]
  },
  {
    id: 4,
    name: "Fisherman's Wharf",
    address: "Beach Street & The Embarcadero, San Francisco, CA 94133",
    coordinates: [37.8080, -122.4177]
  },
  {
    id: 5,
    name: "Union Square",
    address: "333 Post St, San Francisco, CA 94108",
    coordinates: [37.7879, -122.4075]
  }
];

/**
 * Search for locations based on the provided query
 * @param query The search query
 * @returns A promise that resolves to an array of search results
 */
const searchLocations = async (query: string): Promise<SearchResult[]> => {
  // In a real application, this would make an API call
  // For demo purposes, we'll just filter the mock data
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      if (!query) {
        resolve([]);
        return;
      }
      
      const normalizedQuery = query.toLowerCase();
      const results = mockLocations.filter(location => 
        location.name.toLowerCase().includes(normalizedQuery) || 
        location.address.toLowerCase().includes(normalizedQuery)
      );
      
      resolve(results);
    }, 300);
  });
};

export type { SearchResult };
export { searchLocations }; 