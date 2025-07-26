import React, { useEffect, useState } from 'react';
import NavBase from "../components/NavBase.tsx";
import { useTagStore } from '../store/tagStore.ts';
import { Table, Button, Space, Popconfirm, message, Modal, Form, Input, ColorPicker } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Tag } from '../utils/types';

const TagsPage: React.FC = () => {
    const { tags, isLoading, error, fetchTags, createTag, updateTag, deleteTag } = useTagStore();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    const handleDeleteTag = async (tagId: number) => {
        try {
            await deleteTag(tagId);
            message.success('Tag erfolgreich gelöscht');
        } catch (error) {
            message.error('Fehler beim Löschen des Tags');
        }
    };

    const showCreateModal = () => {
        setEditingTag(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditModal = (tag: Tag) => {
        setEditingTag(tag);
        form.setFieldsValue({
            name: tag.name,
            color: (tag as any).color || '#1890ff'
        });
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            if (editingTag) {
                await updateTag(editingTag.id, {
                    name: values.name,
                    color: typeof values.color === 'string' ? values.color : values.color.toHexString()
                });
                message.success('Tag erfolgreich aktualisiert');
            } else {
                await createTag({
                    name: values.name,
                    color: typeof values.color === 'string' ? values.color : values.color.toHexString()
                });
                message.success('Tag erfolgreich erstellt');
            }
            
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Fehler beim Speichern des Tags');
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingTag(null);
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
            title: 'Farbe',
            key: 'color',
            render: (record: Tag) => {
                const color = (record as any).color || '#1890ff';
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div 
                            style={{ 
                                width: '20px', 
                                height: '20px', 
                                backgroundColor: color,
                                border: '1px solid #d9d9d9',
                                borderRadius: '4px'
                            }} 
                        />
                        <span>{color}</span>
                    </div>
                );
            },
        },
        {
            title: 'Aktionen',
            key: 'actions',
            render: (_: any, record: Tag) => (
                <Space size="middle">
                    <Button 
                        icon={<EditOutlined />} 
                        onClick={() => showEditModal(record)}
                        type="default"
                    />
                    <Popconfirm
                        title="Tag löschen"
                        description="Sind Sie sicher, dass Sie diesen Tag löschen möchten?"
                        onConfirm={() => handleDeleteTag(record.id)}
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
                <h1>Tag-Verwaltung</h1>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={showCreateModal}
                >
                    Neuen Tag erstellen
                </Button>
            </div>
            
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <Table 
                dataSource={tags} 
                columns={columns} 
                rowKey="id" 
                loading={isLoading}
                pagination={{ pageSize: 10 }}
                bordered
            />

            <Modal
                title={editingTag ? "Tag bearbeiten" : "Neuen Tag erstellen"}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="Speichern"
                cancelText="Abbrechen"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ color: '#1890ff' }}
                >
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[
                            { required: true, message: 'Bitte geben Sie einen Tag-Namen ein!' },
                            { min: 1, max: 50, message: 'Der Name muss zwischen 1 und 50 Zeichen lang sein!' }
                        ]}
                    >
                        <Input placeholder="Tag-Name eingeben" />
                    </Form.Item>

                    <Form.Item
                        label="Farbe"
                        name="color"
                        rules={[{ required: true, message: 'Bitte wählen Sie eine Farbe!' }]}
                    >
                        <ColorPicker format="hex" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );

    return (
        <NavBase content={content}/>
    );
};

export default TagsPage;
