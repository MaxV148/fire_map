import React, { useState, useEffect } from 'react';
import { Card, Form, Select, DatePicker, Button, Divider, Space, Typography, Radio } from 'antd';
import * as Icons from '@ant-design/icons';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { useTagStore } from '../store/tagStore';
import { useVehicleStore } from '../store/vehicleStore';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface FilterPanelProps {
  onFilterChange?: (filters: FilterValues) => void;
}

export interface FilterValues {
  eventType?: string[];
  issueType?: string[];
  status?: string[];
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
  severity?: string[];
  view?: 'map' | 'list' | 'both';
  tags?: number[];
  vehicles?: number[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange }) => {
  const [form] = Form.useForm();
  const [view, setView] = useState<'map' | 'list' | 'both'>('both');
  
  // Tags und Vehicles aus den Stores importieren
  const { tags, fetchTags } = useTagStore();
  const { vehicles, fetchVehicles } = useVehicleStore();

  // Daten beim Laden der Komponente abrufen
  useEffect(() => {
    fetchTags();
    fetchVehicles();
  }, [fetchTags, fetchVehicles]);

  const handleViewChange = (e: any) => {
    setView(e.target.value);
  };

  const handleFinish = (values: FilterValues) => {
    if (onFilterChange) {
      onFilterChange({
        ...values,
        view
      });
    }
  };

  const handleReset = () => {
    form.resetFields();
    if (onFilterChange) {
      onFilterChange({
        view
      });
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