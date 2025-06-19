import { Card, Typography, Descriptions, Avatar, Button, message, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useUserStore} from "../store/userStore.ts";
import NavBase from "../components/NavBase.tsx";
import { TwoFASetupModal } from "../components/modals/TwoFASetupModal.tsx";
import { useState } from 'react';

const { Title, Text } = Typography;


function ProfilePage() {
    const {user, fetchMe} = useUserStore();
    const [twoFAModalVisible, setTwoFAModalVisible] = useState(false);

    const handleTwoFASetupClick = () => {
        console.log("handleTwoFASetupClick");
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
              <Button
                  type="primary"
                  onClick={handleTwoFASetupClick}
              >
                  {user.otp_configured ? '2FA neu konfigurieren' : '2FA aktivieren'}
              </Button>

              <Button
                  style={{ marginLeft: '8px' }}
                  onClick={() => message.info('Passwortänderung noch nicht implementiert')}
              >
                  Passwort ändern
              </Button>
          </Card>

          <TwoFASetupModal
              visible={twoFAModalVisible}
              onCancel={handleTwoFAModalCancel}
              onSuccess={handleTwoFASetupSuccess}
              userEmail={user.email}
          />
      </div>);



  return (
      <NavBase content={profilePage}/>
  );
}

export default ProfilePage;
