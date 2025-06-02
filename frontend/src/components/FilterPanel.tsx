import React, { useEffect } from 'react';
import { Card, Form, Select, DatePicker, Button, Divider, Space, Typography } from 'antd';
import * as Icons from '@ant-design/icons';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { useTagStore } from '../store/tagStore';
import { useVehicleStore } from '../store/vehicleStore';
import { useFilterStore } from '../store/filterStore';
import { useEventStore } from '../store/eventStore';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface FilterPanelProps {
  onFilterChange?: (filters: FilterValues) => void;
}

export interface FilterValues {
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
  tags?: number[];
  vehicles?: number[];
  view?: 'map' | 'list' | 'both';
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange }) => {
  const [form] = Form.useForm();
  
  // Store importieren
  const { tags, fetchTags } = useTagStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { filters, setFilters, resetFilters } = useFilterStore();
  const { fetchEvents } = useEventStore();
  
  // Daten beim Laden der Komponente abrufen
  useEffect(() => {
    fetchTags();
    fetchVehicles();
    
    // Formular mit Werten aus dem Store vorausfüllen
    form.setFieldsValue({
      dateRange: filters.dateRange,
      tags: filters.tags,
      vehicles: filters.vehicles
    });
  }, [fetchTags, fetchVehicles, form, filters]);

  const handleFinish = (values: FilterValues) => {
    // Store aktualisieren
    setFilters(values);
    
    // Events mit den neuen Filtern laden
    fetchEvents();
    
    if (onFilterChange) {
      onFilterChange(values);
      console.log('FILTER: ', values);
    }
  };

  const handleReset = () => {
    form.resetFields();
    resetFilters();
    
    // Events ohne Filter laden
    fetchEvents();
    
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  // Datum auf letzten Monat einschränken
  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current > dayjs().endOf('day');
  };

  return (
    <Card
      title={<Title level={5}>Filter</Title>}
      style={{ width: '100%' }}
    >
      <Form 
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          eventType: [],
          issueType: [],
          status: [],
          severity: [],
          dateRange: null,
          tags: [],
          vehicles: []
        }}
      >
        <Form.Item name="tags" label="Tags">
          <Select 
            mode="multiple" 
            placeholder="Tags auswählen"
            allowClear
            loading={useTagStore(state => state.isLoading)}
          >
            {tags.map(tag => (
              <Option key={tag.id} value={tag.id}>{tag.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="vehicles" label="Fahrzeuge">
          <Select 
            mode="multiple" 
            placeholder="Fahrzeuge auswählen"
            allowClear
            loading={useVehicleStore(state => state.isLoading)}
          >
            {vehicles.map(vehicle => (
              <Option key={vehicle.id} value={vehicle.id}>{vehicle.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="dateRange" label="Zeitraum">
          <RangePicker 
            style={{ width: '100%' }}
            disabledDate={disabledDate}
            format="DD.MM.YYYY"
          />
        </Form.Item>

        <Divider style={{ margin: '12px 0' }} />
        
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            icon={<Icons.ClearOutlined />} 
            onClick={handleReset}
          >
            Zurücksetzen
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<Icons.FilterOutlined />}
          >
            Filtern
          </Button>
        </Space>
      </Form>
    </Card>
  );
};

export default FilterPanel; 