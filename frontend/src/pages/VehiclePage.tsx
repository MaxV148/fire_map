import React, { useEffect, useState } from 'react';
import NavBase from "../components/NavBase.tsx";
import { useVehicleStore } from '../store/vehicleStore.ts';
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { VehicleType } from '../utils/types';

const VehiclePage: React.FC = () => {
    const { vehicles, isLoading, error, fetchVehicles, createVehicle, updateVehicle, deleteVehicle } = useVehicleStore();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<VehicleType | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    const handleDeleteVehicle = async (vehicleId: number) => {
        try {
            await deleteVehicle(vehicleId);
            message.success('Fahrzeugtyp erfolgreich gelöscht');
        } catch (error) {
            message.error('Fehler beim Löschen des Fahrzeugtyps');
        }
    };

    const showCreateModal = () => {
        setEditingVehicle(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditModal = (vehicle: VehicleType) => {
        setEditingVehicle(vehicle);
        form.setFieldsValue({
            name: vehicle.name
        });
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            if (editingVehicle) {
                await updateVehicle(editingVehicle.id, {
                    name: values.name
                });
                message.success('Fahrzeugtyp erfolgreich aktualisiert');
            } else {
                await createVehicle({
                    name: values.name
                });
                message.success('Fahrzeugtyp erfolgreich erstellt');
            }
            
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Fehler beim Speichern des Fahrzeugtyps');
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingVehicle(null);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Aktionen',
            key: 'actions',
            render: (_: any, record: VehicleType) => (
                <Space size="middle">
                    <Button 
                        icon={<EditOutlined />} 
                        onClick={() => showEditModal(record)}
                        type="default"
                    />
                    <Popconfirm
                        title="Fahrzeugtyp löschen"
                        description="Sind Sie sicher, dass Sie diesen Fahrzeugtyp löschen möchten?"
                        onConfirm={() => handleDeleteVehicle(record.id)}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Fahrzeugtyp-Verwaltung</h1>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={showCreateModal}
                >
                    Neuen Fahrzeugtyp erstellen
                </Button>
            </div>
            
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <Table 
                dataSource={vehicles} 
                columns={columns} 
                rowKey="id" 
                loading={isLoading}
                pagination={{ pageSize: 10 }}
                bordered
            />

            <Modal
                title={editingVehicle ? "Fahrzeugtyp bearbeiten" : "Neuen Fahrzeugtyp erstellen"}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="Speichern"
                cancelText="Abbrechen"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[
                            { required: true, message: 'Bitte geben Sie einen Fahrzeugtyp-Namen ein!' },
                            { min: 1, max: 100, message: 'Der Name muss zwischen 1 und 100 Zeichen lang sein!' }
                        ]}
                    >
                        <Input placeholder="Fahrzeugtyp-Name eingeben" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );

    return (
        <NavBase content={content}/>
    );
};

export default VehiclePage;
