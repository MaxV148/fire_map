import { useState, useEffect } from 'react';
import { 
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Container,
  Grid2
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MapIcon from '@mui/icons-material/Map';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import authService from '../services/authService';
import DashboardWidget from '../components/DashboardWidget';
import LocationMapExample from '../components/LocationMapExample';
import {UserProfile} from "../services/authService";

interface DashboardPageProps {
  onLogout: () => void;
}

const DashboardPage = ({ onLogout }: DashboardPageProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Get user profile from auth service
    const profile = authService.getUserProfile();
    
    if (profile) {
      setUserProfile(profile);
    } else {
      // Fallback to mock data if no profile is available
      setUserProfile({
        id: 1,
        username: 'user123',
      });
    }
  }, []);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    onLogout();
  };

  const drawerContent = (
    <Box
      sx={{ width: 300 }}
      role="presentation"
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: 'primary.main',
            mb: 2
          }}
        >
          {userProfile?.username.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <Typography variant="h6">{userProfile?.username || 'User'}</Typography>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={toggleDrawer(false)}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={toggleDrawer(false)}>
            <ListItemIcon>
              <MapIcon />
            </ListItemIcon>
            <ListItemText primary="Fire Map" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={toggleDrawer(false)}>
            <ListItemIcon>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText primary="Notifications" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={toggleDrawer(false)}>
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Profile Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={toggleDrawer(false)}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box 
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}
      className="dashboard-container"
    >
      <AppBar 
        position="fixed" 
        sx={{ 
          width: '100%',
          left: 0,
          right: 0
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fire Map Dashboard
          </Typography>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* Add toolbar spacing to prevent content from hiding under AppBar */}
      <Toolbar />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Grid2 container spacing={3}>
          {/* Welcome widget */}
          <Grid2 item xs={12}>
            <DashboardWidget title={`Welcome, ${userProfile?.username || 'User'}`}>
              <Typography variant="body1">
                This is your dashboard. Here you can view and manage fire map data.
              </Typography>
            </DashboardWidget>
          </Grid2>
          
          {/* Map overview widget */}
          <Grid2 item xs={12} md={8}>
            <DashboardWidget title="Fire Map Overview" height={600}>
              <LocationMapExample />
            </DashboardWidget>
          </Grid2>
          
          {/* Recent activity widget */}
          <Grid2 item xs={12} md={4}>
            <DashboardWidget title="Recent Activity" height={400}>
              <List>
                {[1, 2, 3, 4].map((item) => (
                  <ListItem key={item} divider={item < 4}>
                    <ListItemText 
                      primary={`Activity ${item}`} 
                      secondary={`This is a description of activity ${item}`} 
                    />
                  </ListItem>
                ))}
              </List>
            </DashboardWidget>
          </Grid2>
          
          {/* Statistics widgets */}
          <Grid2 item xs={12} md={4}>
            <DashboardWidget title="Active Fires">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h3" color="error">
                  24
                </Typography>
              </Box>
            </DashboardWidget>
          </Grid2>
          
          <Grid2 item xs={12} md={4}>
            <DashboardWidget title="Monitored Areas">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h3" color="primary">
                  156
                </Typography>
              </Box>
            </DashboardWidget>
          </Grid2>
          
          <Grid2 item xs={12} md={4}>
            <DashboardWidget title="Alert Level">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h3" color="warning.main">
                  Medium
                </Typography>
              </Box>
            </DashboardWidget>
          </Grid2>
        </Grid2>
      </Container>
      
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default DashboardPage; 