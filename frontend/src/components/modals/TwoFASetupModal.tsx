import React, { useState, useEffect } from 'react';
import { Modal, Steps, Button, Input, message, Typography, Spin } from 'antd';
import { QrcodeOutlined, SafetyOutlined } from '@ant-design/icons';
import authService from '../../services/authService';

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;

interface TwoFASetupModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  userEmail: string;
}

export const TwoFASetupModal: React.FC<TwoFASetupModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  userEmail
}) => {
  const [current, setCurrent] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (visible) {
      setCurrent(0);
      setQrCodeUrl('');
      setVerificationCode('');
      fetchQRCode();
    }
  }, [visible]);

  const fetchQRCode = async () => {
    setIsLoading(true);
    try {
      const blob = await authService.setup2FA();
      const url = URL.createObjectURL(blob);
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Fehler beim Laden des QR-Codes:', error);
      message.error(error instanceof Error ? error.message : 'Fehler beim Laden des QR-Codes');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      message.error('Bitte geben Sie den Verifikationscode ein');
      return;
    }

    setIsVerifying(true);
    try {
      await authService.verify2FASetup(verificationCode);
      message.success('2FA wurde erfolgreich aktiviert!');
      setCurrent(2);
      setTimeout(() => {
        onSuccess();
        onCancel();
      }, 2000);
    } catch (error) {
      console.error('Fehler bei der Verifikation:', error);
      message.error(error instanceof Error ? error.message : 'Verifikation fehlgeschlagen');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNext = () => {
    if (current === 0) {
      setCurrent(1);
    } else if (current === 1) {
      verifyCode();
    }
  };

  const handleCancel = () => {
    // URL cleanup
    if (qrCodeUrl) {
      URL.revokeObjectURL(qrCodeUrl);
    }
    onCancel();
  };

  const steps = [
    {
      title: 'QR-Code scannen',
      icon: <QrcodeOutlined />,
      content: (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Title level={4}>Authenticator-App einrichten</Title>
          <Paragraph>
            Scannen Sie den folgenden QR-Code mit Ihrer Authenticator-App 
            (z.B. Google Authenticator, Authy, Microsoft Authenticator).
          </Paragraph>
          
          {isLoading ? (
            <div style={{ padding: '40px' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>QR-Code wird geladen...</div>
            </div>
          ) : qrCodeUrl ? (
            <div style={{ marginTop: 20 }}>
              <img 
                src={qrCodeUrl} 
                alt="2FA QR Code" 
                style={{ 
                  maxWidth: '250px', 
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  padding: '10px',
                  backgroundColor: 'white'
                }} 
              />
              <div style={{ marginTop: 16, fontSize: '12px', color: '#666' }}>
                Konto: {userEmail}
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px', color: '#ff4d4f' }}>
              Fehler beim Laden des QR-Codes
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Code eingeben',
      icon: <SafetyOutlined />,
      content: (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Title level={4}>Verifikationscode eingeben</Title>
          <Paragraph>
            Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein, 
            um die Einrichtung abzuschließen.
          </Paragraph>
          
          <div style={{ marginTop: 30, marginBottom: 20 }}>
            <Input
              size="large"
              placeholder="6-stelliger Code (z.B. 123456)"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{ 
                fontSize: '18px', 
                textAlign: 'center', 
                letterSpacing: '2px',
                maxWidth: '200px'
              }}
              maxLength={6}
              onPressEnter={verifyCode}
            />
          </div>
          
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Der Code erneuert sich alle 30 Sekunden
          </Text>
        </div>
      )
    },
    {
      title: 'Abgeschlossen',
      content: (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '48px', color: '#52c41a', marginBottom: 16 }}>
            ✓
          </div>
          <Title level={4} style={{ color: '#52c41a' }}>
            2FA erfolgreich aktiviert!
          </Title>
          <Paragraph>
            Ihre Zwei-Faktor-Authentifizierung ist jetzt aktiv. 
            Bei der nächsten Anmeldung werden Sie nach dem Code aus Ihrer Authenticator-App gefragt.
          </Paragraph>
        </div>
      )
    }
  ];

  return (
    <Modal
      title="Zwei-Faktor-Authentifizierung einrichten"
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={
        current < 2 ? [
          <Button key="cancel" onClick={handleCancel}>
            Abbrechen
          </Button>,
          <Button 
            key="next" 
            type="primary" 
            onClick={handleNext}
            disabled={current === 0 && (!qrCodeUrl || isLoading)}
            loading={isVerifying}
          >
            {current === 0 ? 'Weiter' : 'Verifizieren'}
          </Button>
        ] : []
      }
      destroyOnClose
    >
      <Steps current={current} style={{ marginBottom: 30 }}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} icon={item.icon} />
        ))}
      </Steps>
      
      <div style={{ minHeight: '300px' }}>
        {steps[current].content}
      </div>
    </Modal>
  );
}; 