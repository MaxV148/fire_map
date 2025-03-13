import LocationMap, { Location } from "./LocationMap";

export default function LocationMapExample() {
  // Sample location data
  const sampleLocations: Location[] = [
    {
      id: 1,
      position: [51.505, -0.09], // London
      name: "London",
      description: "The capital of England"
    },
    {
      id: 2,
      position: [48.8566, 2.3522], // Paris
      name: "Paris",
      description: "The capital of France"
    },
    {
      id: 3,
      position: [40.7128, -74.0060], // New York
      name: "New York",
      description: "The Big Apple"
    },
    {
      id: 4,
      position: [37.7749, -122.4194], // San Francisco
      name: "San Francisco",
      description: "The Golden Gate City"
    },
    {
      id: 5,
      position: [52.5200, 13.4050], // Berlin
      name: "Berlin",
      description: "The capital of Germany"
    }
  ];

  return (
    <div>
      <h1>Location Map Example</h1>
      <p>This map shows several major cities around the world.</p>
      
      {/* Using the LocationMap component with our sample locations */}
      <LocationMap 
        locations={sampleLocations}
        center={[40, -20]} // Center the map to show all locations
        zoom={3}
        height="600px"
        width="100%"
      />
    </div>
  );
} 