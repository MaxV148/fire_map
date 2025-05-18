import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Select } from 'antd';
import { Tag, VehicleType, Event, EventUpdateInput, Issue } from '../../utils/types';
import { useTagStore } from '../../store/tagStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { useEventStore } from '../../store/eventStore';
import { useIssueStore } from '../../store/issueStore';

const { TextArea } = Input;
const { Option } = Select;

interface EditEventIssueModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
  editingEvent: Event | null;
  editingIssue: Issue | null;
  form: any;
}

export const EditEventIssueModal: React.FC<EditEventIssueModalProps> = ({
  visible,
  onCancel,
  onSave,
  editingEvent,
  editingIssue,
  form
}) => {
  // Verwende die Stores
  const { tags, fetchTags, isLoading: isLoadingTags } = useTagStore();
  const { vehicles, fetchVehicles, isLoading: isLoadingVehicles } = useVehicleStore();
  const { updateEvent } = useEventStore();
  const { updateIssue } = useIssueStore();

  // Lade Tags und Fahrzeugtypen, wenn Modal geöffnet wird
  useEffect(() => {
    if (visible) {
      fetchTags();
      fetchVehicles();
    }
  }, [visible, fetchTags, fetchVehicles]);

  const handleSave = () => {
    form.validateFields()
      .then(async (values: any) => {
        try {
          if (editingEvent) {
            // Erstelle ein EventUpdateInput-Objekt
            const eventUpdateInput: EventUpdateInput = {
              name: values.name,
              description: values.description,
              tag_ids: values.tags,
              vehicle_ids: values.vehicles
            };
            
            // Direkte Verwendung des updateEvent aus dem Store
            // Aber wir rufen trotzdem onSave auf, um die übergeordnete Komponente zu informieren
            await updateEvent(editingEvent.id, eventUpdateInput);
          }
          
          // Rufe die übergeordnete onSave-Funktion auf
          onSave(values);
        } catch (error) {
          console.error('Fehler beim Speichern:', error);
        }
      })
      .catch((info: any) => {
        console.log('Validierungsfehler:', info);
      });
  };

  return (
    <Modal
      title={editingEvent 
        ? `Event bearbeiten: ${editingEvent.name}` 
        : editingIssue 
          ? `Issue bearbeiten: ${editingIssue.name}` 
          : ''}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Abbrechen
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          Speichern
        </Button>
      ]}
      width={600}
    >
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
        {editingEvent && (
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
        )}
      </Form>
    </Modal>
  );
};

export default EditEventIssueModal; 