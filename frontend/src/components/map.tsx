import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, Button, Typography, Space, Tooltip, Tag } from 'antd';
import * as Icons from '@ant-design/icons';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEventStore } from '../store/eventStore';
import { useIssueStore } from '../store/issueStore';
import { useTheme } from '../contexts/ThemeContext';

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

// Benutzerdefinierte Icons für verschiedene Marker-Typen
const eventIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'event-marker' // CSS-Klasse für benutzerdefiniertes Styling
});

const issueIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41], 
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'issue-marker' // CSS-Klasse für benutzerdefiniertes Styling
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
  showEvents?: boolean;
  showIssues?: boolean;
}

export const LocationMap: React.FC<MapProps> = ({
  center = [51.505, -0.09], // Standard: London
  zoom = 13,
  markers = [],
  showEvents = true,
  showIssues = true
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState<number>(zoom);
  const { mode } = useTheme();

  // Events und Issues aus den Stores holen
  const { events, fetchEvents, isLoading: eventsLoading } = useEventStore();
  const { issues, fetchIssues, isLoading: issuesLoading } = useIssueStore();

  // Icon für alle Marker setzen
  useEffect(() => {
    L.Marker.prototype.options.icon = defaultIcon;
  }, []);

  // Events und Issues laden
  useEffect(() => {
    if (showEvents) {
      fetchEvents();
    }
    if (showIssues) {
      fetchIssues();
    }
  }, [fetchEvents, fetchIssues, showEvents, showIssues]);

  const resetView = () => {
    setMapCenter(center);
    setMapZoom(zoom);
  };

  // Dynamic card background based on theme - using colorBgContainer
  const cardBg = mode === 'light' ? '#FAFAFA' : '#1D3557';

  return (
    <Card 
      style={{ width: '100%', height: '100%', backgroundColor: cardBg }}
    >
      <div style={{ height: 400, width: '100%'}}>
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: '100%', width: '100%', borderRadius: '4px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Benutzerdefinierte Marker */}
          {markers.map((marker, index) => (
            <Marker key={`custom-${index}`} position={marker.position}>
              <Popup>
                <Space direction="vertical">
                  <Text strong>{marker.title}</Text>
                  {marker.description && <Text>{marker.description}</Text>}
                </Space>
              </Popup>
            </Marker>
          ))}

          {/* Events anzeigen */}
          {showEvents && events.map((event) => (
            <Marker 
              key={`event-${event.id}`} 
              position={[event.location[0], event.location[1]]} 
              icon={eventIcon}
            >
              <Popup>
                <Space direction="vertical">
                  <Text strong>{event.name}</Text>
                  <Text>{event.description}</Text>
                  <div>
                    {event.tags.map(tag => (
                      <Tag key={tag.id} color="blue">{tag.name}</Tag>
                    ))}
                  </div>
                  <div>
                    {event.vehicles.map(vehicle => (
                      <Tag key={vehicle.id} color="green">{vehicle.name}</Tag>
                    ))}
                  </div>
                  <Text type="secondary">Erstellt: {new Date(event.created_at).toLocaleDateString()}</Text>
                </Space>
              </Popup>
            </Marker>
          ))}

          {/* Issues anzeigen */}
          {showIssues && issues.map((issue) => (
            <Marker 
              key={`issue-${issue.id}`} 
              position={[issue.location[0], issue.location[1]]} 
              icon={issueIcon}
            >
              <Popup>
                <Space direction="vertical">
                  <Text strong>{issue.name}</Text>
                  <Text>{issue.description}</Text>
                  <div>
                    {issue.tags.map(tag => (
                      <Tag key={tag.id} color="red">{tag.name}</Tag>
                    ))}
                  </div>
                  <Text type="secondary">Erstellt: {new Date(issue.created_at).toLocaleDateString()}</Text>
                </Space>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={resetView}>Ansicht zurücksetzen</Button>
      </div>
    </Card>
  );
};

export default LocationMap;
