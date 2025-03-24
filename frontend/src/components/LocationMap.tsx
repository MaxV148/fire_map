import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { LatLngExpression, Map as LeafletMap, LatLng } from "leaflet";
import { useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from "react";

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
  userLocation?: LatLngExpression | null;
  onMapClick?: (position: [number, number]) => void;
}

export interface LocationMapRef {
  flyTo: (position: LatLngExpression, zoom?: number) => void;
  panTo: (position: LatLngExpression) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

// Component to handle map events including clicks
function MapEventHandler({ onMapClick }: { onMapClick?: (position: [number, number]) => void }) {
  const map = useMapEvents({
    click: (e) => {
      if (onMapClick) {
        // Convert LatLng to [lat, lng] array format
        const { lat, lng } = e.latlng;
        onMapClick([lat, lng]);
      }
    },
  });
  
  return null;
}

// Component to control the map and respond to user location changes
function MapController({ userLocation }: { userLocation?: LatLngExpression | null }) {
  const map = useMap();
  
  // Expose the map so it can be found by the parent MapContainer
  useEffect(() => {
    // This effect doesn't do anything except ensure the map is accessible
    // The parent component handles the map centering via ref methods
  }, [map]);
  
  return null;
}

const LocationMap = forwardRef<LocationMapRef, LocationMapProps>(({
  locations,
  center = [51.505, -0.09],
  zoom = 2,
  height = "100vh",
  width = "100%",
  userLocation,
  onMapClick
}, ref) => {
  const mapRef = useRef<LeafletMap | null>(null);
  
  // Expose methods to control the map from parent components
  useImperativeHandle(ref, () => ({
    flyTo: (position: LatLngExpression, newZoom?: number) => {
      if (mapRef.current) {
        mapRef.current.flyTo(position, newZoom || 15);
      }
    },
    panTo: (position: LatLngExpression) => {
      if (mapRef.current) {
        mapRef.current.panTo(position);
      }
    },
    zoomIn: () => {
      if (mapRef.current) {
        mapRef.current.zoomIn(1);
      }
    },
    zoomOut: () => {
      if (mapRef.current) {
        mapRef.current.zoomOut(1);
      }
    }
  }));

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
      style={{ 
        height, 
        width,
        cursor: onMapClick ? 'pointer' : 'grab'
      }}
      scrollWheelZoom={true}
      zoomControl={false}
      ref={(mapInstance: LeafletMap | null) => {
        mapRef.current = mapInstance;
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locationMarkers}
      <MapController userLocation={userLocation} />
      <MapEventHandler onMapClick={onMapClick} />
    </MapContainer>
  );
});

export default LocationMap; 