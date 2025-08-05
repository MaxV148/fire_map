import React, { useEffect, useState } from 'react';
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
  const { login, verify2FA, isLoading, isAuthenticated, requiresMfa, error } = useUserStore();
  const navigate = useNavigate();
  const [mfaCode, setMfaCode] = useState('');

  // Automatische Weiterleitung wenn authentifiziert
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      const success = await login(values.email, values.password);

      if (success && !requiresMfa) {
        message.success('Erfolgreich angemeldet!');
        // Navigation wird automatisch durch useEffect ausgelöst
      } else if (success && requiresMfa) {
        message.info('Bitte geben Sie Ihren 2FA-Code ein.');
      } else {
        message.error(error || 'Anmeldung fehlgeschlagen, bitte versuchen Sie es erneut.');
      }
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message || 'Anmeldung fehlgeschlagen, bitte versuchen Sie es erneut.');
      } else {
        message.error('Anmeldung fehlgeschlagen, bitte versuchen Sie es erneut.');
      }
    }
  };

  const handleMfaSubmit = async () => {
    if (!mfaCode.trim()) {
      message.error('Bitte geben Sie den 2FA-Code ein.');
      return;
    }

    try {
      const success = await verify2FA(mfaCode);
      if (success) {
        message.success('Erfolgreich angemeldet!');
        // Navigation wird automatisch durch useEffect ausgelöst
      } else {
        message.error(error || '2FA-Verifikation fehlgeschlagen.');
      }
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message || '2FA-Verifikation fehlgeschlagen.');
      } else {
        message.error('2FA-Verifikation fehlgeschlagen.');
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
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <img
                  src="/logo.png"
                  alt="Feurix Logo"
                  style={{ height: '120px', width: 'auto' }}
                />
              </div>
              <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
                {requiresMfa ? '2FA-Verifikation' : 'Login'}
              </Title>
              
              {!requiresMfa ? (
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
              ) : (
                <div>
                  <Typography.Paragraph style={{ textAlign: 'center', marginBottom: 30 }}>
                    Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein:
                  </Typography.Paragraph>
                  
                  <Form.Item style={{ marginBottom: 20 }}>
                    <Input
                      size="large"
                      placeholder="6-stelliger Code (z.B. 123456)"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      style={{ 
                        fontSize: '18px', 
                        textAlign: 'center', 
                        letterSpacing: '2px'
                      }}
                      maxLength={6}
                      onPressEnter={handleMfaSubmit}
                    />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 10 }}>
                    <Button 
                      type="primary" 
                      onClick={handleMfaSubmit}
                      loading={isLoading} 
                      block
                      disabled={mfaCode.length !== 6}
                    >
                      Verifizieren
                    </Button>
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="link" 
                      onClick={() => {
                        setMfaCode('');
                        // Reset requiresMfa state durch Logout
                        window.location.reload();
                      }}
                      block
                    >
                      Zurück zum Login
                    </Button>
                  </Form.Item>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default LoginPage;
