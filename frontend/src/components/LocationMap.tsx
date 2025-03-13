import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { useMemo } from "react";

export interface Location {
  id: string | number;
  position: LatLngExpression;
  name: string;
  description?: string;
}

interface LocationMapProps {
  locations: Location[];
  center?: LatLngExpression;
  zoom?: number;
  height?: string;
  width?: string;
}

export default function LocationMap({
  locations,
  center = [51.505, -0.09],
  zoom = 2,
  height = "100vh",
  width = "100%",
}: LocationMapProps) {
  // Memoize the markers to prevent unnecessary re-renders
  const locationMarkers = useMemo(() => {
    return locations.map((location) => (
      <Marker key={location.id} position={location.position}>
        <Popup>
          <div>
            <h3>{location.name}</h3>
            {location.description && <p>{location.description}</p>}
          </div>
        </Popup>
      </Marker>
    ));
  }, [locations]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locationMarkers}
    </MapContainer>
  );
} 