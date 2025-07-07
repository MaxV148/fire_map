import React, { useEffect } from 'react';
import NavBase from "../components/NavBase.tsx";
import { useAdminUserStore } from '../store/adminUserStore.ts';
import { Table, Button, Space, Popconfirm, Select, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { User, UserRole } from '../utils/types';

const UsersPage: React.FC = () => {
    const { users, isLoading, error, fetchUsers, deleteUser, updateUserRole } = useAdminUserStore();


    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDeleteUser = async (userId: number) => {
        const success = await deleteUser(userId);
        if (success) {
            message.success('Benutzer erfolgreich gelöscht');
        } else {
            message.error('Fehler beim Löschen des Benutzers');
        }
    };

    const handleRoleChange = async (userId: number, role_id: number) => {
        const success = await updateUserRole(userId, role_id);
        if (success) {
            message.success('Benutzerrolle erfolgreich aktualisiert');
        } else {
            message.error('Fehler beim Aktualisieren der Benutzerrolle');
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
            title: 'Rolle',
            dataIndex: 'role',
            key: 'role',
            render: (role: string, record: User) => (
                <Select
                    defaultValue={role}
                    style={{ width: 120 }}
                    onChange={(value) => handleRoleChange(record.id, parseInt(value))}
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
                    <Popconfirm
                        title="Benutzer löschen"
                        description="Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="Ja"
                        cancelText="Nein"
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
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