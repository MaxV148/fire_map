import React, { useEffect } from 'react';
import { Badge,Breadcrumb,Button,Col,Divider,Dropdown,Input,Layout,Menu,Row,Space,Typography } from 'antd';
import * as Icons from '@ant-design/icons';
import { LocationMap } from "./components/map.tsx";
import { EventsIssuesList } from "./components/EventsIssuesList.tsx";
import { FilterPanel, FilterValues } from "./components/FilterPanel.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import UsersPage from "./pages/UsersPage.tsx";
import { useUserStore } from './store/userStore';
import { User} from "./utils/types.ts";

interface IconProps {
    icon: string;
    [key: string]: any;
}

function Icon(props: IconProps) {
    const IconComponent = Icons[props.icon as keyof typeof Icons] as React.ComponentType<any>;
    return <IconComponent {...props} />;
}

export default function App() {
    const [collapsed, setCollapsed] = React.useState(true);
    const [selectedKeys, setSelectedKeys] = React.useState(['dashboard']);
    const [value, setValue] = React.useState<string>('');
    const [filters, setFilters] = React.useState<FilterValues>({
        view: 'both'
    });
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [userProfile, setUserProfile] = React.useState<User | null>(null);
    const [currentPage, setCurrentPage] = React.useState<string>('dashboard');
    const { isAuthenticated, user, logout, isAdmin } = useUserStore();

    useEffect(() => {
        const checkAuthStatus = async () => {
            if (isAuthenticated) {
                try {
                    setUserProfile(user);
                    setIsLoggedIn(true);
                } catch (error) {
                    console.error('Fehler beim Abrufen des Benutzerprofils:', error);
                    logout()
                    setIsLoggedIn(false);
                }
            }
        };

        checkAuthStatus();

        return () => {
        };
    }, [isAuthenticated, logout, user]);

    const handleFilterChange = (newFilters: FilterValues) => {
        setFilters(newFilters);
    };

    const handleLogin = async (email: string) => {
        try {
            if (user) {
                setUserProfile(user);
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.error('Fehler beim Abrufen des Benutzerprofils:', error);
        }
    };

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        setUserProfile(null);
    };

    const handleMenuClick = (pageKey: string) => {
        setCurrentPage(pageKey);
    };

    const renderDashboard = () => {
        return (
            <Layout hasSider={true}>
                <Layout.Sider
                    collapsible={true}
                    breakpoint="lg"
                    theme="dark"
                    collapsed={collapsed}
                    onCollapse={(...args) => {
                        let collapsed = args[0];
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
                            style={{ fontSize: '50px', color: '#ffffff' }}
                        />
                    </Col>
                    <Menu
                        mode="inline"
                        theme="dark"
                        selectedKeys={selectedKeys}
                        onSelect={(...args) => {
                            let selectedKeys = args[0].selectedKeys;
                            setSelectedKeys(selectedKeys);
                            setCurrentPage(selectedKeys[0]);
                        }}
                    >
                        <Menu.Item
                            key="dashboard"
                            icon={<Icon icon="DashboardOutlined" />}
                        >
                            Dashboard
                        </Menu.Item>
                        <Divider/>
                        <Menu.Item
                            key="events"
                            icon={<Icon icon="CalendarOutlined" />}
                        >
                            Events
                        </Menu.Item>
                        {isAdmin && (
                            <Menu.SubMenu
                                key={'admin'}
                                title={'Admin'}
                                icon={<Icon icon="DeploymentUnitOutlined" />}>
                                <Menu.Item key={'users'} icon={<Icon icon="UserOutlined" />}>Users</Menu.Item>
                                <Menu.Item key={'invitations'} icon={<Icon icon="MailOutlined" />}>Invitations</Menu.Item>
                                <Menu.Item key={'permissions'} icon={<Icon icon="SecurityScanOutlined" />}>Permissions</Menu.Item>
                            </Menu.SubMenu>
                        )}
                        <Menu.Item
                            key="item-5"
                            icon={<Icon icon="HeartOutlined" />}
                        >
                            Favorites
                        </Menu.Item>
                    </Menu>
                </Layout.Sider>
                <Layout hasSider={false}>
                    <Layout.Header style={{ background: '#ffffff' }}>
                        <Row
                            justify="start"
                            gutter={0}
                        >
                            <Space
                                size="middle"
                                style={{ flex: 1 }}
                            >
                                <Button
                                    type="text"
                                    size="large"
                                    icon={<Icon icon="MenuOutlined" />}
                                    onClick={() => {
                                        setCollapsed(true);
                                    }}
                                />
                                <Col>
                                    <Typography.Title
                                        level={4}
                                        style={{ margin: '0' }}
                                        type="secondary"
                                    >
                                        {currentPage === 'profile' ? 'Profil' : 'Dashboard'}
                                    </Typography.Title>
                                </Col>
                            </Space>
                            <Space size="small">
                                <Input
                                    placeholder="Search"
                                    style={{ width: '200px' }}
                                    prefix={<Icon icon="SearchOutlined" />}
                                    value={value}
                                    onChange={(...args) => {
                                        let value = args[0].target.value;
                                        setValue(value);
                                    }}
                                />
                                <Dropdown
                                    menu={{
                                        items: [
                                            { 
                                                key: 'profile', 
                                                label: 'Profil',
                                                onClick: () => handleMenuClick('profile')
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
                                        icon={<Icon icon="UserOutlined" />}
                                    >
                                        {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Benutzer'}
                                    </Button>
                                </Dropdown>
                                <Button
                                    type="dashed"
                                    shape="circle"
                                    icon={<Icon icon="SettingOutlined" />}
                                />
                                <Badge count="4">
                                    <Button
                                        type="dashed"
                                        shape="circle"
                                        icon={<Icon icon="BellOutlined" />}
                                    />
                                </Badge>
                            </Space>
                        </Row>
                    </Layout.Header>
                    <Layout.Content>
                        <Space
                            size="middle"
                            direction="horizontal"
                            split="j"
                        >
                            <Breadcrumb style={{ marginBottom: '24px' }}>
                                <Breadcrumb.Item>
                                    <Typography.Link href="#/">Home</Typography.Link>
                                </Breadcrumb.Item>
                                <Breadcrumb.Item>
                                    {currentPage === 'profile' ? 'Profil' : 'Dashboard'}
                                </Breadcrumb.Item>
                            </Breadcrumb>
                        </Space>
                        
                        {currentPage === 'profile' ? (
                            <ProfilePage />
                        ) : (
                            <>
                                <Row gutter={[16, 16]}>
                                    <Col span={24}>
                                        <LocationMap 
                                            center={[48.1351, 11.5820]} 
                                            zoom={12}
                                            markers={[
                                                {
                                                    position: [48.1351, 11.5820],
                                                    title: "München",
                                                    description: "Hauptstadt von Bayern"
                                                }
                                            ]} 
                                        />
                                    </Col>
                                </Row>
                                
                                <Row gutter={[16, 16]} style={{ marginTop: '16px', marginLeft: '16px', marginRight: '16px', marginBottom: '16px' }}>
                                    <Col span={12}>
                                        <EventsIssuesList filters={filters} />
                                    </Col>
                                    <Col span={12}>
                                        <FilterPanel onFilterChange={handleFilterChange} />
                                    </Col>
                                </Row>
                            </>
                        )}
                    </Layout.Content>
                    <Layout.Footer style={{ backgroundColor: '#ffffff' }}>
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

    return isLoggedIn ? renderDashboard() : <LoginPage onLogin={handleLogin} />;
}