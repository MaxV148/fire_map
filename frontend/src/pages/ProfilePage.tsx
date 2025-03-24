import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Switch,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  Grid
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import authService, { UserProfile } from '../services/authService';

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading2FA, setIsLoading2FA] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [disableOtpCode, setDisableOtpCode] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    const loadUserData = async () => {
      // Lade das Benutzerprofil
      const profile = authService.getUserProfile();
      if (profile) {
        setUserProfile(profile);
      }

      // Prüfe 2FA Status
      try {
        const is2FAActive = await authService.check2FAStatus();
        setIs2FAEnabled(is2FAActive);
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Fehler beim Laden des 2FA-Status',
          severity: 'error'
        });
      }
    };

    loadUserData();
  }, []);

  const setup2FA = async () => {
    try {
      setIsLoading2FA(true);
      const response = await fetch('http://localhost:8000/v1/user/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to setup 2FA');
      }

      // Konvertiere die Antwort in einen Blob und erstelle eine URL
      const blob = await response.blob();
      const qrUrl = URL.createObjectURL(blob);
      setQrCodeUrl(qrUrl);
      setShowQRDialog(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Fehler beim Einrichten von 2FA',
        severity: 'error'
      });
    } finally {
      setIsLoading2FA(false);
    }
  };

  const verify2FA = async () => {
    try {
      const response = await fetch('http://localhost:8000/v1/user/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        },
        body: JSON.stringify({ code: otpCode })
      });

      if (!response.ok) {
        throw new Error('Invalid OTP code');
      }

      setIs2FAEnabled(true);
      setShowOTPDialog(false);
      setSnackbar({
        open: true,
        message: '2FA wurde erfolgreich aktiviert',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Ungültiger OTP-Code',
        severity: 'error'
      });
    }
  };

  const disable2FA = async () => {
    try {
      const response = await fetch('http://localhost:8000/v1/user/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        },
        body: JSON.stringify({ 
          code: disableOtpCode,
          confirm: true 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to disable 2FA');
      }

      setIs2FAEnabled(false);
      setShowDisableDialog(false);
      setSnackbar({
        open: true,
        message: '2FA wurde erfolgreich deaktiviert',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Fehler beim Deaktivieren von 2FA',
        severity: 'error'
      });
    }
  };

  const handleQRClose = () => {
    setShowQRDialog(false);
    setShowOTPDialog(true);
    // Bereinige die QR-Code URL
    if (qrCodeUrl) {
      URL.revokeObjectURL(qrCodeUrl);
      setQrCodeUrl(null);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <SecurityIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Profil Einstellungen
        </Typography>
      </Box>

      {/* Benutzerprofil */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Benutzerprofil
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>Benutzername:</strong> {userProfile?.username}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>Benutzer ID:</strong> {userProfile?.id}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* 2FA Einstellungen */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Zwei-Faktor-Authentifizierung (2FA)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Switch
            checked={is2FAEnabled}
            onChange={() => is2FAEnabled ? setShowDisableDialog(true) : setup2FA()}
            disabled={isLoading2FA}
          />
          <Typography sx={{ ml: 1 }}>
            {is2FAEnabled ? '2FA ist aktiviert' : '2FA ist deaktiviert'}
          </Typography>
          {isLoading2FA && <CircularProgress size={20} sx={{ ml: 2 }} />}
        </Box>
      </Paper>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onClose={handleQRClose}>
        <DialogTitle>2FA Einrichtung</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Scannen Sie diesen QR-Code mit Ihrer Authenticator-App (z.B. Google Authenticator):
          </DialogContentText>
          {qrCodeUrl && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <img src={qrCodeUrl} alt="2FA QR Code" style={{ maxWidth: '100%' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQRClose}>Weiter</Button>
        </DialogActions>
      </Dialog>

      {/* OTP Verifizierung Dialog */}
      <Dialog open={showOTPDialog} onClose={() => setShowOTPDialog(false)}>
        <DialogTitle>OTP Code Verifizierung</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Geben Sie den Code aus Ihrer Authenticator-App ein:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="OTP Code"
            type="text"
            fullWidth
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOTPDialog(false)}>Abbrechen</Button>
          <Button onClick={verify2FA} variant="contained">
            Verifizieren
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2FA Deaktivierung Dialog */}
      <Dialog open={showDisableDialog} onClose={() => setShowDisableDialog(false)}>
        <DialogTitle>2FA Deaktivieren</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Um 2FA zu deaktivieren, geben Sie bitte Ihren aktuellen OTP-Code ein:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="OTP Code"
            type="text"
            fullWidth
            value={disableOtpCode}
            onChange={(e) => setDisableOtpCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDisableDialog(false)}>Abbrechen</Button>
          <Button onClick={disable2FA} color="error" variant="contained">
            2FA Deaktivieren
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar für Benachrichtigungen */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage; 