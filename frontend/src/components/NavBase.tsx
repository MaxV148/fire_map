import React from 'react';
import {Badge, Button, Col, Dropdown, Layout, Menu, Row, Space, Typography} from "antd";
import * as Icons from '@ant-design/icons';
import {useUserStore} from "../store/userStore.ts";
import {useNavigate} from "react-router-dom";
import {useTheme} from "../contexts/ThemeContext";


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
    const {mode, toggleTheme} = useTheme();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
    };

    // Dynamic header background based on theme - using colorBgContainer
    const headerBg = mode === 'light' ? '#FAFAFA' : '#1D3557';
    return (
        <Layout hasSider={true}>
            <Layout.Sider
                collapsible={true}
                breakpoint="lg"
                style={{minHeight: '100vh', minWidth: '100vw'}}
                theme={mode}
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
                    <img
                        src="/logo.png"
                        alt="Logo"
                        style={{height: '80px', width: 'auto'}}
                    />
                </Col>
                <Menu
                    mode="inline"
                    theme={mode}
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
                    {isAdmin && (
                        <Menu.SubMenu
                            key={'admin'}
                            title={'Admin'}
                            icon={<Icon icon="DeploymentUnitOutlined"/>}>
                            <Menu.Item key={'users'} icon={<Icon icon="UserOutlined"/>}
                                       onClick={() => navigate('/user')}>Users</Menu.Item>
                            <Menu.Item key={'invitations'} icon={<Icon icon="MailOutlined"/>}
                                       onClick={() => navigate('/invitations')}>Invitations</Menu.Item>
                            <Menu.Item key={'tags'} icon={<Icon icon="TagsOutlined"/>}
                                       onClick={() => navigate('/tags')}>Tags</Menu.Item>
                            <Menu.Item key={'vehicles'} icon={<Icon icon="CarOutlined"/>}
                                       onClick={() => navigate('/vehicles')}>Fahrzeugtypen</Menu.Item>
                        </Menu.SubMenu>
                    )}
                </Menu>
            </Layout.Sider>
            <Layout hasSider={false}>
                <Layout.Header style={{background: headerBg}}>
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
                            <Button
                                type="text"
                                icon={<Icon icon={mode === 'light' ? 'MoonOutlined' : 'SunOutlined'}/>}
                                onClick={toggleTheme}
                                title={mode === 'light' ? 'Zu Dark Mode wechseln' : 'Zu Light Mode wechseln'}
                            />
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
                <Layout.Footer style={{backgroundColor: headerBg}}>
                    <Row
                        gutter={16}
                        justify="space-between"
                    >
                        <Col>
                            <Typography.Text>© Feurix.</Typography.Text>
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