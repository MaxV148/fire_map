import React, { useEffect } from 'react';
import NavBase from "../components/NavBase.tsx";
import { useAdminUserStore } from '../store/adminUserStore.ts';
import { Table, Button, Space, Select, message, Tag } from 'antd';
import { CheckOutlined, StopOutlined, KeyOutlined } from '@ant-design/icons';
import { User, UserRole } from '../utils/types';

const UsersPage: React.FC = () => {
    const { users, isLoading, error, fetchUsers, deactivateUser, updateUserRole, resetUserPassword } = useAdminUserStore();


    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId: number, role_id: number) => {
        const success = await updateUserRole(userId, role_id);
        if (success) {
            message.success('Benutzerrolle erfolgreich aktualisiert');
        } else {
            message.error('Fehler beim Aktualisieren der Benutzerrolle');
        }
    };

    const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        const success = await deactivateUser(userId, newStatus);
        if (success) {
            message.success(newStatus ? 'Benutzer erfolgreich deaktiviert' : 'Benutzer erfolgreich aktiviert');
        } else {
            message.error('Fehler beim Ändern des Benutzerstatus');
        }
    };

    const handlePasswordReset = async (userId: number) => {
        const success = await resetUserPassword(userId);
        if (success) {
            message.success('Password-Reset-E-Mail wurde erfolgreich versendet');
        } else {
            message.error('Fehler beim Versenden der Password-Reset-E-Mail');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'E-Mail',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Vorname',
            dataIndex: 'first_name',
            key: 'first_name',
        },
        {
            title: 'Nachname',
            dataIndex: 'last_name',
            key: 'last_name',
        },
        {
            title: 'Status',
            dataIndex: 'deactivated',
            key: 'status',
            render: (deactivated: boolean) => (
                <Tag color={deactivated ? 'red' : 'green'}>
                    {deactivated ? 'Deaktiviert' : 'Aktiv'}
                </Tag>
            ),
        },
        {
            title: 'Rolle',
            dataIndex: 'role',
            key: 'role',
            render: (role: string, record: User) => (
                <Select
                    defaultValue={role}
                    style={{ width: 120 }}
                    onChange={(value) => handleRoleChange(record.id, parseInt(value))}
                    disabled={record.deactivated}
                >
                    <Select.Option value={UserRole.USER}>Benutzer</Select.Option>
                    <Select.Option value={UserRole.ADMIN}>Admin</Select.Option>
                </Select>
            ),
        },
        {
            title: 'Aktionen',
            key: 'actions',
            render: (_: any, record: User) => (
                <Space size="middle">
                    <Button
                        type={record.deactivated ? "primary" : "default"}
                        danger={!record.deactivated}
                        icon={record.deactivated ? <CheckOutlined /> : <StopOutlined />}
                        onClick={() => handleToggleUserStatus(record.id, record.deactivated)}
                    >
                        {record.deactivated ? 'Aktivieren' : 'Deaktivieren'}
                    </Button>
                    <Button
                        type="default"
                        icon={<KeyOutlined />}
                        onClick={() => handlePasswordReset(record.id)}
                        disabled={record.deactivated}
                    >
                        Passwort zurücksetzen
                    </Button>
                </Space>
            ),
        },
    ];

    const content = (
        <div style={{ padding: '20px' }}>
            <h1>Benutzerverwaltung</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <Table 
                dataSource={users} 
                columns={columns} 
                rowKey="id" 
                loading={isLoading}
                pagination={{ pageSize: 10 }}
                bordered
            />
        </div>
    );

    return (
        <NavBase content={content}/>
    );
};

export default UsersPage;