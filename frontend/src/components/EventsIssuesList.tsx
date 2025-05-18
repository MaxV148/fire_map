import React, { useState, useEffect } from 'react';
import { Card, List, Tabs, Tag, Typography, Space, Badge, Empty, Form, Modal, Button, message, Divider } from 'antd';
import * as Icons from '@ant-design/icons';
import { FilterValues } from './FilterPanel';
import EditEventIssueModal from './modals/EditEventIssueModal';
import CreateEventIssueModal from './modals/CreateEventIssueModal';
import { useUserStore} from "../store/userStore.ts";
import { useEventStore} from "../store/eventStore.ts";
import { useIssueStore } from "../store/issueStore.ts";
import { Event, Issue } from '../utils/types.ts'


const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface EventsIssuesListProps {
  filters?: FilterValues;
}

export const EventsIssuesList: React.FC<EventsIssuesListProps> = ({ filters }) => {
  const [activeTab, setActiveTab] = useState<string>('events');
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [form] = Form.useForm();
  const { isAuthenticated } = useUserStore();
  const { events, fetchEvents, isLoading: eventsLoading, updateEvent } = useEventStore();
  const { issues, fetchIssues, isLoading: issuesLoading, updateIssue } = useIssueStore();


  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents().catch(error => {
        console.error('Fehler beim Laden der Events:', error);
        message.error('Events konnten nicht geladen werden');
      });
      
      fetchIssues().catch(error => {
        console.error('Fehler beim Laden der Issues:', error);
        message.error('Issues konnten nicht geladen werden');
      });
    }
  }, [filters, isAuthenticated, fetchEvents, fetchIssues]);


  const getTypeIcon = () => {
    return <Icons.EnvironmentFilled/>;
  };

  const handleEventClick = (event: Event) => {
    setEditingEvent(event);
    setEditingIssue(null);
    form.setFieldsValue({
      name: event.name,
      description: event.description,
      tags: event.tags.map(tag => tag.id),
      vehicles: event.vehicles.map(vehicle => vehicle.id)
    });
    setIsEditModalVisible(true);
  };

  const handleIssueClick = (issue: Issue) => {
    setEditingIssue(issue);
    setEditingEvent(null);
    form.setFieldsValue({
      name: issue.name,
      description: issue.description,
      tags: issue.tags.map(tag => tag.id)
    });
    setIsEditModalVisible(true);
  };

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    setEditingEvent(null);
    setEditingIssue(null);
    form.resetFields();
  };

  const handleCreateModalCancel = () => {
    setIsCreateModalVisible(false);
  };

  const handleCreateSuccess = () => {
    // Aktualisiere die Listen nach erfolgreicher Erstellung
    fetchEvents();
    fetchIssues();
  };

  const handleModalSave = async (values: any) => {
    if (editingEvent) {
      try {
        // Bereite das Event-Update vor
        const eventData = {
          name: values.name,
          description: values.description,
          tag_ids: values.tags,
          vehicle_ids: values.vehicles || []
        };

        // Nutze die updateEvent Funktion aus dem EventStore
        const updatedEvent = await updateEvent(editingEvent.id, eventData);
        console.log('Aktualisiertes Event:', updatedEvent);
        message.success('Event erfolgreich aktualisiert');
      } catch (error: any) {
        console.error('Fehler beim Aktualisieren des Events:', error);
        message.error('Fehler beim Aktualisieren des Events: ' + (error.message || 'Unbekannter Fehler'));
      }
    } else if (editingIssue) {
      try {
        // Bereite das Issue-Update vor
        const issueData = {
          name: values.name,
          description: values.description,
          tag_ids: values.tags
        };

        // Nutze die updateIssue Funktion aus dem IssueStore
        const updatedIssue = await updateIssue(editingIssue.id, issueData);
        console.log('Aktualisiertes Issue:', updatedIssue);
        message.success('Issue erfolgreich aktualisiert');
      } catch (error: any) {
        console.error('Fehler beim Aktualisieren des Issues:', error);
        message.error('Fehler beim Aktualisieren des Issues: ' + (error.message || 'Unbekannter Fehler'));
      }
    }

    setIsEditModalVisible(false);
    setEditingEvent(null);
    setEditingIssue(null);
    form.resetFields();
  };


  return (
    <>
      <Card
        style={{ width: '100%', height: '100%' }}
        actions={[
            <Button 
                type="primary" 
                icon={<Icons.PlusOutlined />} 
                onClick={() => setIsCreateModalVisible(true)}
            >
                {activeTab === 'events' ? 'Neues Event' : 'Neues Issue'}
            </Button>
        ]}
      >
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{ padding: '0 16px' }}
        >
          <TabPane
            tab={
              <span>
                <Icons.CalendarOutlined />
                <Badge count={events.length} size="small" offset={[10, -5]}>
                  <span style={{ padding: '0 5px' }}>Events</span>
                </Badge>
              </span>
            } 
            key="events"
          >
            <List
              loading={eventsLoading}
              dataSource={events}
              locale={{ emptyText: <Empty description="Keine Events gefunden" /> }}
              renderItem={(event) => (
                <List.Item
                  key={event.id}
                  actions={[
                    <Icons.EditOutlined 
                      key="edit" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }} 
                    />,
                    <Icons.EnvironmentOutlined 
                      key="map" 
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  ]}
                  style={{ cursor: 'default' }}
                >
                  <List.Item.Meta
                    avatar={getTypeIcon()}
                    title={
                      <Space>
                        <Text strong>{event.name}</Text>
                        {event.tags.map((tag) => (
                          <Tag key={tag.id} color="blue">{tag.name}</Tag>
                        ))}
                      </Space>
                    }
                    description={event.description}
                  />
                </List.Item>
              )}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <Icons.ExclamationCircleOutlined />
                <Badge count={issues.length} size="small" offset={[10, -5]}>
                  <span style={{ padding: '0 5px' }}>Issues</span>
                </Badge>
              </span>
            } 
            key="issues"
          >
            <List
              loading={issuesLoading}
              dataSource={issues}
              locale={{ emptyText: <Empty description="Keine Issues gefunden" /> }}
              renderItem={(issue) => (
                <List.Item
                  key={issue.id}
                  actions={[
                    <Icons.EditOutlined 
                      key="edit" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIssueClick(issue);
                      }} 
                    />,
                    <Icons.EnvironmentOutlined 
                      key="map" 
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  ]}
                  style={{ cursor: 'default' }}
                >
                  <List.Item.Meta
                    avatar={getTypeIcon()}
                    title={
                      <Space>
                        <Text strong>{issue.name}</Text>
                        {issue.tags.map((tag) => (
                          <Tag key={tag.id} color="magenta">{tag.name}</Tag>
                        ))}
                      </Space>
                    }
                    description={issue.description}
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Bearbeitungs-Modal */}
      <EditEventIssueModal
        visible={isEditModalVisible}
        onCancel={handleEditModalCancel}
        onSave={handleModalSave}
        editingEvent={editingEvent}
        editingIssue={editingIssue}
        form={form}
      />

      {/* Erstellungs-Modal */}
      <CreateEventIssueModal
        visible={isCreateModalVisible}
        onCancel={handleCreateModalCancel}
        onSuccess={handleCreateSuccess}
        defaultType={activeTab as 'event' | 'issue'}
      />
    </>
  );
};

export default EventsIssuesList; 