import { Card, Typography, Descriptions, Avatar, Button, message, Row, Col, Modal, Input } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useUserStore} from "../store/userStore.ts";
import NavBase from "../components/NavBase.tsx";
import { TwoFASetupModal } from "../components/modals/TwoFASetupModal.tsx";
import { useState } from 'react';

const { Title, Text } = Typography;


function ProfilePage() {
    const user = useUserStore(state => state.user);
    const fetchMe = useUserStore(state => state.fetchMe);
    const disable2FA = useUserStore(state => state.disable2FA);
    const [twoFAModalVisible, setTwoFAModalVisible] = useState(false);
    const [disableTwoFAModalVisible, setDisableTwoFAModalVisible] = useState(false);
    const [disableCode, setDisableCode] = useState('');




    const handleTwoFASetupClick = () => {
        setTwoFAModalVisible(true);
    };

    const handleTwoFAModalCancel = () => {
        setTwoFAModalVisible(false);
    };

    const handleTwoFASetupSuccess = async () => {
        // Benutzerprofil neu laden, um den aktualisierten 2FA-Status zu erhalten
        await fetchMe();
        message.success('2FA wurde erfolgreich eingerichtet!');
    };

    const handleDisableTwoFAClick = () => {
        setDisableTwoFAModalVisible(true);
        setDisableCode('');
    };

    const handleDisableTwoFACancel = () => {
        setDisableTwoFAModalVisible(false);
        setDisableCode('');
    };

    const handleDisableTwoFAConfirm = async () => {
        if (!disableCode.trim()) {
            message.error('Bitte geben Sie Ihren 2FA-Code ein');
            return;
        }

        const success = await disable2FA(disableCode, true);
        if (success) {
            message.success('2FA wurde erfolgreich deaktiviert!');
            setDisableTwoFAModalVisible(false);
            setDisableCode('');
            await fetchMe();
        }
    };

  if (!user) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Card style={{ marginBottom: '24px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
          <Title level={3}>Fehler beim Laden des Profils</Title>
          <Text>Bitte melden Sie sich erneut an, um Ihre Profildaten anzuzeigen.</Text>
        </Card>
      </div>
    );
  }
  const profilePage = (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <Title level={2}>Mein Profil</Title>

          <Card style={{ marginBottom: '24px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
              <Row gutter={[24, 24]} align="middle">
                  <Col xs={24} sm={8} style={{ 
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                  }}>
                      <Avatar
                          size={100}
                          icon={<UserOutlined />}
                          style={{
                              backgroundColor: '#E63946', // Neue Primärfarbe aus unserem Theme
                              marginBottom: '16px',
                              boxShadow: '0 4px 12px rgba(230, 57, 70, 0.2)' // Weicher Schatten mit Primärfarbe
                          }}
                      >
                          {user.first_name[0]}{user.last_name[0]}
                      </Avatar>
                      <Title level={4} style={{ margin: '0 0 8px 0', textAlign: 'center' }}>
                          {user.first_name} {user.last_name}
                      </Title>
                      <Text type="secondary" style={{ textAlign: 'center' }}>
                          {user.role}
                      </Text>
                  </Col>

                  <Col xs={24} sm={16}>
                      <Descriptions title="Benutzerinformationen" bordered column={1}>
                          <Descriptions.Item label="E-Mail">{user.email}</Descriptions.Item>
                          <Descriptions.Item label="Vorname">{user.first_name}</Descriptions.Item>
                          <Descriptions.Item label="Nachname">{user.last_name}</Descriptions.Item>
                          <Descriptions.Item label="Mitglied seit">{new Date(user.created_at).toLocaleDateString('de-DE')}</Descriptions.Item>
                          <Descriptions.Item label="Rolle">{user.role}</Descriptions.Item>
                          <Descriptions.Item label="2FA Status">
                              {user.otp_configured ? 'Aktiviert' : 'Nicht aktiviert'}
                          </Descriptions.Item>
                      </Descriptions>
                  </Col>
              </Row>
          </Card>

          <Card title="Sicherheit" style={{ marginBottom: '24px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
              {!user.otp_configured ? (
                  <Button
                      type="primary"
                      onClick={handleTwoFASetupClick}
                  >
                      2FA aktivieren
                  </Button>
              ) : (
                  <Button
                      type="primary"
                      danger
                      onClick={handleDisableTwoFAClick}
                  >
                      2FA deaktivieren
                  </Button>
              )}

              <Button
                  style={{ marginLeft: '8px' }}
                  onClick={() => message.info('Passwortänderung noch nicht implementiert')}
              >
                  Passwort ändern
              </Button>
          </Card>

          <TwoFASetupModal
              open={twoFAModalVisible}
              onCancel={handleTwoFAModalCancel}
              onSuccess={handleTwoFASetupSuccess}
              userEmail={user.email}
          />

          <Modal
              title="2FA deaktivieren"
              open={disableTwoFAModalVisible}
              onOk={handleDisableTwoFAConfirm}
              onCancel={handleDisableTwoFACancel}
              okText="Deaktivieren"
              cancelText="Abbrechen"
              okButtonProps={{ danger: true }}
          >
              <p>Um die Zwei-Faktor-Authentifizierung zu deaktivieren, geben Sie bitte Ihren aktuellen 2FA-Code ein:</p>
              <Input
                  placeholder="6-stelliger 2FA-Code"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  maxLength={6}
              />
          </Modal>
      </div>);



  return (
      <NavBase content={profilePage}/>
  );
}

export default ProfilePage;
