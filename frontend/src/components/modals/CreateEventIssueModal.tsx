import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Select, Tabs, message, Radio, Space } from 'antd';
import { Tag, VehicleType } from '../../utils/types';
import { useTagStore } from '../../store/tagStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { useEventStore } from '../../store/eventStore';
import { useIssueStore } from '../../store/issueStore';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface CreateEventIssueModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  defaultType?: 'event' | 'issue';
}

export const CreateEventIssueModal: React.FC<CreateEventIssueModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  defaultType = 'event'
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>(defaultType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Verwende die Stores
  const { tags, fetchTags, isLoading: isLoadingTags } = useTagStore();
  const { vehicles, fetchVehicles, isLoading: isLoadingVehicles } = useVehicleStore();
  const { createEvent } = useEventStore();
  const { createIssue } = useIssueStore();

  // Lade Tags und Fahrzeugtypen, wenn Modal geöffnet wird
  useEffect(() => {
    if (visible) {
      fetchTags();
      fetchVehicles();
      form.resetFields();
      setLocation(null);
    }
  }, [visible, fetchTags, fetchVehicles, form]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    form.resetFields();
    setLocation(null);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      message.error('Geolocation wird von Ihrem Browser nicht unterstützt');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: [number, number] = [
          position.coords.latitude,
          position.coords.longitude
        ];
        setLocation(newLocation);
        form.setFieldsValue({ location: `${newLocation[0].toFixed(6)}, ${newLocation[1].toFixed(6)}` });
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Fehler bei der Standortermittlung:', error);
        message.error(`Standortermittlung fehlgeschlagen: ${error.message}`);
        setIsLoadingLocation(false);
      }
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      // Verwende entweder die manuelle Eingabe oder die GPS-Koordinaten
      let locationCoords: [number, number] = [0, 0];
      if (location) {
        locationCoords = location;
      } else if (values.location) {
        const coords = values.location.split(',').map((coord: string) => parseFloat(coord.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          locationCoords = [coords[0], coords[1]];
        }
      }

      if (activeTab === 'event') {
        const eventData = {
          name: values.name,
          description: values.description,
          location: locationCoords,
          tag_ids: values.tags || [],
          vehicle_ids: values.vehicles || []
        };
        await createEvent(eventData);
        message.success('Event erfolgreich erstellt');
      } else if (activeTab === 'issue') {
        const issueData = {
          name: values.name,
          description: values.description,
          location: locationCoords,
          tag_ids: values.tags || []
        };
        await createIssue(issueData);
        message.success('Issue erfolgreich erstellt');
      }

      onSuccess();
      onCancel();
    } catch (error) {
      console.error('Fehler beim Erstellen:', error);
      message.error('Fehler beim Speichern: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gemeinsames Formularfeld für den Standort, das in beiden Tabs verwendet wird
  const locationFormItem = (
    <Form.Item
      name="location"
      label="Standort (Latitude, Longitude)"
      help="Format: 52.520008, 13.404954"
    >
      <Space.Compact style={{ width: '100%' }}>
        <Input 
          placeholder="Koordinaten eingeben oder aktuelle Position verwenden" 
          value={location ? `${location[0].toFixed(6)}, ${location[1].toFixed(6)}` : undefined}
        />
        <Button 
          onClick={getCurrentLocation} 
          loading={isLoadingLocation}
          icon={<span role="img" aria-label="position">📍</span>}
        >
          Aktuelle Position
        </Button>
      </Space.Compact>
    </Form.Item>
  );

  return (
    <Modal
      title="Neues Element erstellen"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Abbrechen
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          loading={isSubmitting}
        >
          Erstellen
        </Button>
      ]}
      width={600}
    >
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="Event" key="event">
          <Form
            form={form}
            layout="vertical"
            initialValues={{ 
              name: '', 
              description: '', 
              tags: [],
              vehicles: []
            }}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Bitte geben Sie einen Namen ein' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Beschreibung"
              rules={[{ required: true, message: 'Bitte geben Sie eine Beschreibung ein' }]}
            >
              <TextArea rows={4} />
            </Form.Item>
            {locationFormItem}
            <Form.Item
              name="tags"
              label="Tags"
            >
              <Select 
                mode="multiple" 
                placeholder="Tags auswählen"
                style={{ width: '100%' }}
                loading={isLoadingTags}
              >
                {tags.map(tag => (
                  <Option key={tag.id} value={tag.id}>{tag.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="vehicles"
              label="Fahrzeuge"
            >
              <Select 
                mode="multiple" 
                placeholder="Fahrzeuge auswählen"
                style={{ width: '100%' }}
                loading={isLoadingVehicles}
              >
                {vehicles.map(vehicle => (
                  <Option key={vehicle.id} value={vehicle.id}>{vehicle.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="Issue" key="issue">
          <Form
            form={form}
            layout="vertical"
            initialValues={{ 
              name: '', 
              description: '', 
              tags: []
            }}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Bitte geben Sie einen Namen ein' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Beschreibung"
              rules={[{ required: true, message: 'Bitte geben Sie eine Beschreibung ein' }]}
            >
              <TextArea rows={4} />
            </Form.Item>
            {locationFormItem}
            <Form.Item
              name="tags"
              label="Tags"
            >
              <Select 
                mode="multiple" 
                placeholder="Tags auswählen"
                style={{ width: '100%' }}
                loading={isLoadingTags}
              >
                {tags.map(tag => (
                  <Option key={tag.id} value={tag.id}>{tag.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default CreateEventIssueModal; 