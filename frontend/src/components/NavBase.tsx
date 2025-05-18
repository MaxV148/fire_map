import React from 'react';
import {Badge, Button, Col, Divider, Dropdown, Layout, Menu, Row, Space, Typography} from "antd";
import * as Icons from '@ant-design/icons';
import {useUserStore} from "../store/userStore.ts";
import {useNavigate} from "react-router-dom";


interface IconProps {
    icon: string;

    [key: string]: any;
}

function Icon(props: IconProps) {
    const IconComponent = Icons[props.icon as keyof typeof Icons] as React.ComponentType<any>;
    return <IconComponent {...props} />;
}

interface NavBaseProps {
    content: React.ReactNode;
}


const NavBase: React.FC<NavBaseProps> = ({content}) => {

    const [collapsed, setCollapsed] = React.useState(false);
    const [selectedKeys, setSelectedKeys] = React.useState(['dashboard']);
    const {user, logout, isAdmin} = useUserStore();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
    };
    return (
        <Layout hasSider={true}>
            <Layout.Sider
                collapsible={true}
                breakpoint="lg"
                theme="dark"
                collapsed={collapsed}
                onCollapse={(...args) => {
                    const collapsed = args[0];
                    setCollapsed(collapsed);
                }}
            >
                <Col
                    flex="1"
                    style={{
                        textAlign: 'center',
                        paddingTop: '20px',
                        paddingBottom: '20px'
                    }}
                >
                    <Icon
                        icon="AntDesignOutlined"
                        style={{fontSize: '50px', color: '#ffffff'}}
                    />
                </Col>
                <Menu
                    mode="inline"
                    theme="dark"
                    selectedKeys={selectedKeys}
                    onSelect={(...args) => {
                        const selectedKeys = args[0].selectedKeys;
                        setSelectedKeys(selectedKeys);
                    }}
                >
                    <Menu.Item
                        key="dashboard"
                        icon={<Icon icon="DashboardOutlined"/>}
                        onClick={() => navigate('/')}
                    >
                        Dashboard
                    </Menu.Item>
                    <Divider/>
                    {isAdmin && (
                        <Menu.SubMenu
                            key={'admin'}
                            title={'Admin'}
                            icon={<Icon icon="DeploymentUnitOutlined"/>}>
                            <Menu.Item key={'users'} icon={<Icon icon="UserOutlined"/>}
                                       onClick={() => navigate('/user')}>Users</Menu.Item>
                            <Menu.Item key={'invitations'} icon={<Icon icon="MailOutlined"/>}>Invitations</Menu.Item>
                        </Menu.SubMenu>
                    )}
                </Menu>
            </Layout.Sider>
            <Layout hasSider={false}>
                <Layout.Header style={{background: '#ffffff'}}>
                    <Row
                        justify="start"
                        gutter={0}
                    >
                        <Space
                            size="middle"
                            style={{flex: 1}}
                        >
                            <Button
                                type="text"
                                size="large"
                                icon={<Icon icon="MenuOutlined"/>}
                                onClick={() => {
                                    setCollapsed(collapsed => !collapsed);
                                }}
                            />
                            <Col>
                                <Typography.Title
                                    level={4}
                                    style={{margin: '0'}}
                                    type="secondary"
                                >
                                    {'Dashboard'}
                                </Typography.Title>
                            </Col>
                        </Space>
                        <Space size="small">
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            key: 'profile',
                                            label: 'Profil',
                                            onClick: () => navigate('/profile')
                                        },
                                        {
                                            key: 'logout',
                                            label: 'Abmelden',
                                            danger: true,
                                            onClick: handleLogout
                                        }
                                    ]
                                }}
                            >
                                <Button
                                    type="text"
                                    icon={<Icon icon="UserOutlined"/>}
                                >
                                    {user ? `${user.first_name} ${user.last_name}` : 'Benutzer'}
                                </Button>
                            </Dropdown>
                            <Button
                                type="dashed"
                                shape="circle"
                                icon={<Icon icon="SettingOutlined"/>}
                            />
                            <Badge count="4">
                                <Button
                                    type="dashed"
                                    shape="circle"
                                    icon={<Icon icon="BellOutlined"/>}
                                />
                            </Badge>
                        </Space>
                    </Row>
                </Layout.Header>
                <Layout.Content>
                    {content}
                </Layout.Content>
                <Layout.Footer style={{backgroundColor: '#ffffff'}}>
                    <Row
                        gutter={16}
                        justify="space-between"
                    >
                        <Col>
                            <Typography.Text>© Something goes here.</Typography.Text>
                        </Col>
                        <Col>
                            <Space
                                size="large"
                                direction="horizontal"
                            >
                                <Typography.Link>About Us</Typography.Link>
                                <Typography.Link>Blog</Typography.Link>
                                <Typography.Link>Dashboard</Typography.Link>
                                <Typography.Link>Events</Typography.Link>
                            </Space>
                        </Col>
                    </Row>
                </Layout.Footer>
            </Layout>
        </Layout>
    );
};

export default NavBase;