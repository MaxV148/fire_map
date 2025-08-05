import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Steps, Button, Input, message, Typography, Spin } from 'antd';
import { QrcodeOutlined, SafetyOutlined } from '@ant-design/icons';
import { useUserStore } from '../../store/userStore';

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;

interface TwoFASetupModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  userEmail: string;
}

export const TwoFASetupModal: React.FC<TwoFASetupModalProps> = ({
  open,
  onCancel,
  onSuccess,
  userEmail
}) => {
  const { setup2FA, verify2FA, error } = useUserStore();
  const [current, setCurrent] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingQR, setIsLoadingQR] = useState(false);

  const fetchQRCode = async () => {
    try {
      setIsLoadingQR(true);
      
      const url = await setup2FA();
      
      if (url) {
        setQrCodeUrl(url);
      } else {
        message.error(error || 'Fehler beim Laden des QR-Codes');
      }
    } catch (err) {
      console.error('Fehler beim Laden des QR-Codes:', err);
      message.error('Unerwarteter Fehler beim Laden des QR-Codes');
    } finally {
      setIsLoadingQR(false);
    }
  };

  useEffect(() => {
    if (open) {
      setCurrent(0);
      setQrCodeUrl('');
      setVerificationCode('');
      setIsLoadingQR(false);
    }
  }, [open]);

  const verifyCode = useCallback(async () => {
    if (!verificationCode.trim()) {
      message.error('Bitte geben Sie den Verifikationscode ein');
      return;
    }

    setIsVerifying(true);
    try {
      const success = await verify2FA(verificationCode);
      if (success) {
        message.success('2FA wurde erfolgreich aktiviert!');
        setCurrent(2);
        setTimeout(() => {
          onSuccess();
          onCancel();
        }, 2000);
      } else {
        // Error wird vom userStore gesetzt
        message.error(error || 'Verifikation fehlgeschlagen');
      }
    } catch (err) {
      console.error('Fehler bei der Verifikation:', err);
      message.error('Unerwarteter Fehler bei der Verifikation');
    } finally {
      setIsVerifying(false);
    }
  }, [verificationCode, verify2FA, error, onSuccess, onCancel]);

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
          
          {!qrCodeUrl && !isLoadingQR ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Button type="primary" onClick={fetchQRCode}>
                QR-Code laden
              </Button>
              <div style={{ marginTop: 16, fontSize: '12px', color: '#666' }}>
                Klicken Sie hier, um den QR-Code für die Einrichtung zu laden.
              </div>
            </div>
          ) : isLoadingQR ? (
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
      open={open}
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
            disabled={current === 0 && (!qrCodeUrl || isLoadingQR)}
            loading={isVerifying}
          >
            {current === 0 ? 'Weiter' : 'Verifizieren'}
          </Button>
        ] : []
      }
      destroyOnHidden
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