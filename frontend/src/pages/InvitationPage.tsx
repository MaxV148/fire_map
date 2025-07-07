import React, { useEffect, useState } from 'react';
import NavBase from "../components/NavBase.tsx";

import {
    Card,
    Form,
    Input,
    Button,
    Table,
    Space,
    Popconfirm,
    message,
    Typography,
    Tag,
    Row,
    Col,
    Divider,
    Spin,
    Alert,
} from 'antd';
import { 
    PlusOutlined, 
    DeleteOutlined, 
    MailOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useInvitationStore } from '../store/invitationStore';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text } = Typography;

interface InvitationFormValues {
    email: string;
    expire_days: number;
}

const InvitationPage: React.FC = () => {
    const [form] = Form.useForm();
    const [isCreating, setIsCreating] = useState(false);
    const { mode } = useTheme();
    
    const {
        invitations,
        totalCount,
        isLoading,
        error,
        fetchInvitations,
        createInvitation,
        deleteInvitation,
    } = useInvitationStore();

    // Dynamic card background based on theme - using colorBgContainer
    const cardBg = mode === 'light' ? '#FAFAFA' : '#1D3557';

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    const handleCreateInvitation = async (values: InvitationFormValues) => {
        setIsCreating(true);
        
        try {
            const success = await createInvitation({
                email: values.email,
                expire_days: values.expire_days || 7,
            });

            if (success) {
                message.success('Einladung erfolgreich versendet!');
                form.resetFields();
            } else {
                message.error('Fehler beim Versenden der Einladung');
            }
        } catch {
            message.error('Fehler beim Versenden der Einladung');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteInvitation = async (inviteUuid: string, email: string) => {
        try {
            const success = await deleteInvitation(inviteUuid);
            
            if (success) {
                message.success(`Einladung für ${email} erfolgreich gelöscht`);
            } else {
                message.error('Fehler beim Löschen der Einladung');
            }
        } catch {
            message.error('Fehler beim Löschen der Einladung');
        }
    };

    const getStatusTag = (invitation: any) => {
        const now = new Date();
        const expireDate = new Date(invitation.expire_date);
        
        if (invitation.is_used) {
            return <Tag color="success" icon={<CheckCircleOutlined />}>Verwendet</Tag>;
        } else if (expireDate < now) {
            return <Tag color="error" icon={<ExclamationCircleOutlined />}>Abgelaufen</Tag>;
        } else {
            return <Tag color="processing" icon={<ClockCircleOutlined />}>Ausstehend</Tag>;
        }
    };

    const columns = [
        {
            title: 'E-Mail',
            dataIndex: 'email',
            key: 'email',
            render: (email: string) => (
                <Space>
                    <MailOutlined />
                    <Text>{email}</Text>
                </Space>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            render: (record: any) => getStatusTag(record),
        },
        {
            title: 'Erstellt am',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => new Date(date).toLocaleDateString('de-DE'),
        },
        {
            title: 'Läuft ab am',
            dataIndex: 'expire_date',
            key: 'expire_date',
            render: (date: string) => new Date(date).toLocaleDateString('de-DE'),
        },
        {
            title: 'Aktionen',
            key: 'actions',
            render: (record: any) => (
                <Space>
                    <Popconfirm
                        title="Einladung löschen"
                        description={`Möchten Sie die Einladung für ${record.email} wirklich löschen?`}
                        onConfirm={() => handleDeleteInvitation(record.invite_uuid, record.email)}
                        okText="Ja"
                        cancelText="Nein"
                    >
                        <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />}
                            disabled={isLoading}
                        >
                            Löschen
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <NavBase content={
            <div style={{ padding: '24px' }}>
            <Title level={2}>Einladungen verwalten</Title>
            <Text type="secondary">
                Verwalten Sie Einladungen für neue Benutzer der Fire Map Plattform.
            </Text>

            <Divider />

            <Row gutter={[24, 24]}>
                {/* Formular zum Erstellen neuer Einladungen */}
                <Col xs={24} lg={8}>
                    <Card 
                        title="Neue Einladung versenden" 
                        variant="outlined"
                        style={{ backgroundColor: cardBg }}
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleCreateInvitation}
                        >
                            <Form.Item
                                label="E-Mail-Adresse"
                                name="email"
                                rules={[
                                    { required: true, message: 'Bitte geben Sie eine E-Mail-Adresse ein!' },
                                    { type: 'email', message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein!' },
                                ]}
                            >
                                <Input 
                                    prefix={<MailOutlined />}
                                    placeholder="beispiel@email.com"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Gültigkeitsdauer (Tage)"
                                name="expire_days"
                                initialValue={7}
                                rules={[
                                    { type: 'number', min: 1, max: 30, message: 'Bitte wählen Sie zwischen 1 und 30 Tagen!' },
                                ]}
                            >
                                <Input 
                                    type="number"
                                    min={1}
                                    max={30}
                                    placeholder="7"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isCreating}
                                    icon={<PlusOutlined />}
                                    size="large"
                                    block
                                >
                                    Einladung versenden
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                {/* Liste der versendeten Einladungen */}
                <Col xs={24} lg={16}>
                    <Card 
                        title={`Versendete Einladungen (${totalCount})`}
                        variant="outlined"
                        style={{ backgroundColor: cardBg }}
                        extra={
                            <Button 
                                onClick={() => fetchInvitations()}
                                loading={isLoading}
                            >
                                Aktualisieren
                            </Button>
                        }
                    >
                        {error && (
                            <Alert
                                message="Fehler"
                                description={error}
                                type="error"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        <Spin spinning={isLoading}>
                            <Table
                                columns={columns}
                                dataSource={invitations}
                                rowKey="invite_uuid"
                                pagination={{
                                    total: totalCount,
                                    pageSize: 10,
                                    showSizeChanger: false,
                                    showQuickJumper: true,
                                    showTotal: (total, range) =>
                                        `${range[0]}-${range[1]} von ${total} Einladungen`,
                                }}
                                locale={{
                                    emptyText: 'Keine Einladungen vorhanden',
                                }}
                            />
                        </Spin>
                    </Card>
                </Col>
            </Row>
        </div>
        }/>
    );
};

export default InvitationPage;
