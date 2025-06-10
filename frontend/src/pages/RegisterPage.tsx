import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Typography, Layout, Row, Col, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useUserStore } from '../store/userStore';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Title } = Typography;
const { Content } = Layout;

interface RegisterFormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const { register, isLoading, isAuthenticated } = useUserStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  const inviteToken = searchParams.get('invitation') || '';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!inviteToken) {
      message.error('Kein gültiger Einladungslink gefunden!');
      navigate('/login');
    }
  }, [inviteToken, navigate]);

  const handleSubmit = async (values: RegisterFormValues) => {
    if (values.password !== values.confirmPassword) {
      message.error('Die Passwörter stimmen nicht überein!');
      return;
    }

    try {
      const success = await register(
        values.first_name,
        values.last_name,
        values.email,
        values.password,
        inviteToken
      );

      if (success) {
        message.success('Registrierung erfolgreich! Willkommen bei Fire Map!');
        // Navigation wird automatisch durch useEffect ausgelöst
      } else {
        message.error('Registrierung fehlgeschlagen, bitte versuchen Sie es erneut.');
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || 'Registrierung fehlgeschlagen, bitte versuchen Sie es erneut.');
      } else {
        message.error('Registrierung fehlgeschlagen, bitte versuchen Sie es erneut.');
      }
    }
  };

  if (!inviteToken) {
    return null; // Oder Loading-Spinner
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content>
        <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
          <Col xs={22} sm={18} md={14} lg={10} xl={8}>
            <Card 
              style={{ 
                width: '100%', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
              }}
            >
              <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
                Registrierung
              </Title>
              
              <Form
                form={form}
                name="register"
                onFinish={handleSubmit}
                layout="vertical"
                size="large"
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="first_name"
                      label="Vorname"
                      rules={[
                        { required: true, message: 'Bitte geben Sie Ihren Vornamen ein!' },
                        { min: 2, message: 'Der Vorname muss mindestens 2 Zeichen lang sein!' }
                      ]}
                    >
                      <Input 
                        prefix={<UserOutlined />} 
                        placeholder="Max" 
                        autoComplete="given-name"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="last_name"
                      label="Nachname"
                      rules={[
                        { required: true, message: 'Bitte geben Sie Ihren Nachnamen ein!' },
                        { min: 2, message: 'Der Nachname muss mindestens 2 Zeichen lang sein!' }
                      ]}
                    >
                      <Input 
                        prefix={<UserOutlined />} 
                        placeholder="Müller" 
                        autoComplete="family-name"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="email"
                  label="E-Mail-Adresse"
                  rules={[
                    { required: true, message: 'Bitte geben Sie Ihre E-Mail-Adresse ein!' },
                    { type: 'email', message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein!' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="empfaenger@example.com" 
                    autoComplete="email"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Passwort"
                  rules={[
                    { required: true, message: 'Bitte geben Sie ein Passwort ein!' },
                    { min: 6, message: 'Das Passwort muss mindestens 6 Zeichen lang sein!' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Passwort"
                    autoComplete="new-password"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Passwort bestätigen"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Bitte bestätigen Sie Ihr Passwort!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Die Passwörter stimmen nicht überein!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Passwort bestätigen"
                    autoComplete="new-password"
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={isLoading} 
                    block
                  >
                    Registrieren
                  </Button>
                </Form.Item>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Button 
                    type="link" 
                    onClick={() => navigate('/login')}
                  >
                    Bereits ein Konto? Hier anmelden
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default RegisterPage;
