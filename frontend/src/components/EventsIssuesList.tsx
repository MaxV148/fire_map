import React, { useState, useEffect } from 'react';
import { Card, List, Tabs, Tag, Typography, Space, Badge, Empty, Form, Button, message, Pagination } from 'antd';
import * as Icons from '@ant-design/icons';
import { FilterValues } from './FilterPanel';
import EditEventIssueModal from './modals/EditEventIssueModal';
import CreateEventIssueModal from './modals/CreateEventIssueModal';
import { useUserStore} from "../store/userStore.ts";
import { useEventStore} from "../store/eventStore.ts";
import { useIssueStore } from "../store/issueStore.ts";
import { Event, Issue } from '../utils/types.ts'
import { useTheme } from '../contexts/ThemeContext'; 

const { Text } = Typography;
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
  const { 
    events, 
    pagination, 
    fetchEvents, 
    isLoading: eventsLoading, 
    updateEvent,
    goToPage,
    setPageSize
  } = useEventStore();
  const { 
    issues, 
    pagination: issuePagination, 
    fetchIssues, 
    isLoading: issuesLoading, 
    updateIssue,
    goToPage: goToIssuePage,
    setPageSize: setIssuePageSize
  } = useIssueStore();
  const { mode } = useTheme();

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

  const handlePageChange = async (page: number, pageSize?: number) => {
    try {
      if (pageSize && pageSize !== pagination.limit) {
        await setPageSize(pageSize);
      } else {
        await goToPage(page);
      }
    } catch (error) {
      console.error('Fehler beim Wechseln der Seite:', error);
      message.error('Fehler beim Laden der Events');
    }
  };

  const handleIssuePageChange = async (page: number, pageSize?: number) => {
    try {
      if (pageSize && pageSize !== issuePagination.limit) {
        await setIssuePageSize(pageSize);
      } else {
        await goToIssuePage(page);
      }
    } catch (error) {
      console.error('Fehler beim Wechseln der Seite:', error);
      message.error('Fehler beim Laden der Issues');
    }
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

  const cardBg = mode === 'light' ? '#FAFAFA' : '#1D3557';

  return (
    <>
      <Card
        style={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: cardBg,
          '--ant-card-actions-bg': cardBg
        } as React.CSSProperties}
        styles={{
          actions: {
            backgroundColor: cardBg,
            borderTop: `1px solid ${mode === 'light' ? '#ECECEC' : '#457B9D'}`
          }
        }}
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
                <Badge count={pagination.total_count} size="small" offset={[10, -5]}>
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
            {pagination.total_count > 0 && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Pagination
                  current={pagination.page}
                  total={pagination.total_count}
                  pageSize={pagination.limit}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} von ${total} Events`
                  }
                  pageSizeOptions={['5', '10', '20', '50', '100']}
                  onChange={handlePageChange}
                  disabled={eventsLoading}
                  size="small"
                />
              </div>
            )}
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <Icons.ExclamationCircleOutlined />
                <Badge count={issuePagination.total_count} size="small" offset={[10, -5]}>
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
            {issuePagination.total_count > 0 && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Pagination
                  current={issuePagination.page}
                  total={issuePagination.total_count}
                  pageSize={issuePagination.limit}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} von ${total} Issues`
                  }
                  pageSizeOptions={['5', '10', '20', '50', '100']}
                  onChange={handleIssuePageChange}
                  disabled={issuesLoading}
                  size="small"
                />
              </div>
            )}
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
        defaultType={activeTab === 'events' ? 'event' : 'issue'}
      />
    </>
  );
};

export default EventsIssuesList; 