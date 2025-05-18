import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, Button, Typography, Space, Tooltip } from 'antd';
import * as Icons from '@ant-design/icons';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Lösung für das Leaflet Icon Problem
const defaultIcon = L.icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const { Text, Title } = Typography;

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title: string;
    description?: string;
  }>;
}

export const LocationMap: React.FC<MapProps> = ({
  center = [51.505, -0.09], // Standard: London
  zoom = 13,
  markers = []
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState<number>(zoom);

  // Icon für alle Marker setzen
  useEffect(() => {
    L.Marker.prototype.options.icon = defaultIcon;
  }, []);

  const resetView = () => {
    setMapCenter(center);
    setMapZoom(zoom);
  };

  return (
    <Card 
      style={{ width: '100%', height: '100%' }}
    >
      <div style={{ height: 400, width: '100%' }}>
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: '100%', width: '100%', borderRadius: '4px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {markers.map((marker, index) => (
            <Marker key={index} position={marker.position}>
              <Popup>
                <Space direction="vertical">
                  <Text strong>{marker.title}</Text>
                  {marker.description && <Text>{marker.description}</Text>}
                </Space>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Card>
  );
};

export default LocationMap;
