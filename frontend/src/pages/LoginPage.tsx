import React from 'react';
import { Form, Input, Button, Card, Typography, Layout, Row, Col, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useUserStore } from '../store/userStore';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Content } = Layout;

interface LoginFormValues {
  email: string;
  password: string;
}



const LoginPage: React.FC = () => {
  const { login, isLoading } = useUserStore();
  const navigate = useNavigate();

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      const success = await login(values.email, values.password);

      if (success) {
        message.success('Erfolgreich angemeldet!');
        navigate('/');
      } else {
        message.error('Anmeldung fehlgeschlagen, bitte versuchen Sie es erneut.');
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || 'Anmeldung fehlgeschlagen, bitte versuchen Sie es erneut.');
      } else {
        message.error('Anmeldung fehlgeschlagen, bitte versuchen Sie es erneut.');
      }
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content>
        <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
          <Col xs={22} sm={16} md={12} lg={8} xl={6}>
            <Card 
              style={{ 
                width: '100%', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
              }}
            >
              <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
                Anmeldung
              </Title>
              
              <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={handleSubmit}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Bitte geben Sie Ihre E-Mail-Adresse ein!' },
                    { type: 'email', message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein!' }
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="E-Mail-Adresse" 
                    autoComplete="email"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Bitte geben Sie Ihr Passwort ein!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Passwort"
                    autoComplete="current-password"
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={isLoading} 
                    block
                  >
                    Anmelden
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default LoginPage;
