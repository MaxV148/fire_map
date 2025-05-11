import { useState, useEffect, useRef } from 'react';
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
  Grid,
  Paper,
  Chip,
  Tab,
  Tabs,
  CircularProgress,
  Tooltip,
  Button,
  TextField
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EventIcon from '@mui/icons-material/Event';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import SchoolIcon from '@mui/icons-material/School';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Fab from '@mui/material/Fab';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import authService from '../services/authService';
import LocationMap, { LocationMapRef, Location } from '../components/LocationMap';
import CreateEventModal from '../components/modals/CreateEventModal';
import UpdateEntityModal from '../components/modals/UpdateEntityModal';
import {UserProfile} from "../services/authService";
import { getEventsByUser, getEventsByTag, getEventsByVehicle, filterEventsByTime, Event } from '../services/eventService';
import { getIssuesByUser, getIssuesByTag, filterIssuesByTime, Issue } from '../services/issueService';
import { getAllTags, Tag } from '../services/tagService';
import { getAllVehicleTypes, VehicleType } from '../services/vehicleTypeService';
import { eventsToLocations, getMapCenter } from '../utils/mapUtils';
import EntityList from '../components/EntityList';
import InfoIcon from '@mui/icons-material/Info';
import AdminPage from './AdminPage';
import ProfilePage from './ProfilePage';

interface DashboardPageProps {
  onLogout: () => void;
}

// Type to represent tabs
type TabOption = 'events' | 'issues';

// Type for time filter options
type TimeFilterOption = 'today' | 'week' | 'month' | null;

// Page type to handle navigation
type PageType = 'dashboard' | 'admin' | 'profile';

const DashboardPage = ({ onLogout }: DashboardPageProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Event | Issue | null>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<'event' | 'issue'>('event');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationError, setShowLocationError] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<[number, number] | null>(null);
  const mapRef = useRef<LocationMapRef>(null);
  
  // State for events, issues, and loading indicators
  const [userEvents, setUserEvents] = useState<Location[]>([]);
  const [rawEvents, setRawEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [issuesError, setIssuesError] = useState<string | null>(null);
  
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<TabOption>('events');
  
  // Filter states
  const [tags, setTags] = useState<Tag[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isLoadingVehicleTypes, setIsLoadingVehicleTypes] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  // New state for clicked map location
  const [clickedMapLocation, setClickedMapLocation] = useState<[number, number] | null>(null);
  
  // New state for current page
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

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
    
    // Fetch tags and vehicle types
    fetchTags();
    fetchVehicleTypes();
  }, []);

  // Fetch events and issues when the user profile is loaded
  useEffect(() => {
    if (userProfile?.id) {
      fetchUserEvents(userProfile.id);
      fetchUserIssues(userProfile.id);
    }
  }, [userProfile]);

  // Update filtered events when raw events or filters change
  useEffect(() => {
    applyEventFilters();
  }, [rawEvents, selectedTagId, selectedVehicleId]);
  
  // Update filtered issues when issues or filters change
  useEffect(() => {
    applyIssueFilters();
  }, [issues, selectedTagId]);

  // Update map center when user events change
  useEffect(() => {
    if (userEvents.length > 0) {
      const center = getMapCenter(userEvents);
      setMapCenter(center);
    }
  }, [userEvents]);
  
  // Update map locations when filtered events change
  useEffect(() => {
    updateMapLocations();
  }, [filteredEvents]);

  const fetchTags = async () => {
    setIsLoadingTags(true);
    try {
      const fetchedTags = await getAllTags();
      setTags(fetchedTags);
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setIsLoadingTags(false);
    }
  };

  const fetchVehicleTypes = async () => {
    setIsLoadingVehicleTypes(true);
    try {
      const fetchedVehicleTypes = await getAllVehicleTypes();
      setVehicleTypes(fetchedVehicleTypes);
    } catch (error) {
      console.error("Error fetching vehicle types:", error);
    } finally {
      setIsLoadingVehicleTypes(false);
    }
  };

  const fetchUserEvents = async (userId: number) => {
    setIsLoadingEvents(true);
    setEventsError(null);
    try {
      const events = await getEventsByUser(userId);
      setRawEvents(events);
      const locationEvents = eventsToLocations(events);
      setUserEvents(locationEvents);
    } catch (error) {
      console.error("Error fetching user events:", error);
      setEventsError("Failed to load events. Please try again later.");
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const fetchUserIssues = async (userId: number) => {
    setIsLoadingIssues(true);
    setIssuesError(null);
    try {
      const userIssues = await getIssuesByUser(userId);
      setIssues(userIssues);
      console.log(`Loaded ${userIssues.length} issues for user ${userId}`);
    } catch (error) {
      console.error("Error fetching user issues:", error);
      setIssuesError("Failed to load issues. Please try again later.");
    } finally {
      setIsLoadingIssues(false);
    }
  };
  
  const applyEventFilters = async () => {
    if (isLoadingEvents) return;
    
    let filteredResults = [...rawEvents];
    
    // If tag filter is active and we're not already filtered by tag
    if (selectedTagId) {
      try {
        setIsLoadingEvents(true);
        const tagEvents = await getEventsByTag(selectedTagId);
        // Only keep events that match the user's events (intersection)
        filteredResults = tagEvents.filter(tagEvent => 
          rawEvents.some(userEvent => userEvent.id === tagEvent.id)
        );
      } catch (error) {
        console.error(`Error filtering events by tag ${selectedTagId}:`, error);
      } finally {
        setIsLoadingEvents(false);
      }
    }
    
    // If vehicle filter is active
    if (selectedVehicleId) {
      try {
        setIsLoadingEvents(true);
        const vehicleEvents = await getEventsByVehicle(selectedVehicleId);
        // Filter to only keep events that are in our current filtered set
        filteredResults = vehicleEvents.filter(vehicleEvent => 
          filteredResults.some(event => event.id === vehicleEvent.id)
        );
      } catch (error) {
        console.error(`Error filtering events by vehicle ${selectedVehicleId}:`, error);
      } finally {
        setIsLoadingEvents(false);
      }
    }
    
    setFilteredEvents(filteredResults);
  };
  
  const applyIssueFilters = async () => {
    if (isLoadingIssues) return;
    
    let filteredResults = [...issues];
    
    // If tag filter is active
    if (selectedTagId) {
      try {
        setIsLoadingIssues(true);
        const tagIssues = await getIssuesByTag(selectedTagId);
        // Only keep issues that match the user's issues (intersection)
        filteredResults = tagIssues.filter(tagIssue => 
          issues.some(userIssue => userIssue.id === tagIssue.id)
        );
      } catch (error) {
        console.error(`Error filtering issues by tag ${selectedTagId}:`, error);
      } finally {
        setIsLoadingIssues(false);
      }
    }
    
    setFilteredIssues(filteredResults);
  };
  
  const updateMapLocations = () => {
    if (filteredEvents.length > 0) {
      const locationEvents = eventsToLocations(filteredEvents);
      setUserEvents(locationEvents);
    } else if (rawEvents.length > 0) {
      const locationEvents = eventsToLocations(rawEvents);
      setUserEvents(locationEvents);
    }
  };

  const handleTagFilterClick = async (tagId: number) => {
    if (selectedTagId === tagId) {
      // Deselect the tag if it's already selected
      setSelectedTagId(null);
    } else {
      setSelectedTagId(tagId);
    }
  };

  const handleVehicleFilterClick = async (vehicleId: number) => {
    if (selectedVehicleId === vehicleId) {
      // Deselect the vehicle if it's already selected
      setSelectedVehicleId(null);
    } else {
      setSelectedVehicleId(vehicleId);
    }
  };

  const clearFilters = () => {
    setSelectedTagId(null);
    setSelectedVehicleId(null);
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: TabOption) => {
    setActiveTab(newValue);
  };
  
  // New function to handle page navigation
  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
    setDrawerOpen(false); // Close drawer after navigation
  };

  // Handle entity click to focus on the map
  const handleEntityClick = (entity: Event | Issue) => {
    // We need to check if the entity is an Event with a location
    if ('location' in entity && entity.location && entity.location.length >= 2) {
      // Convert from [longitude, latitude] to [latitude, longitude] format
      const position: [number, number] = [entity.location[1], entity.location[0]];
      if (mapRef.current) {
        mapRef.current.flyTo(position, 15);
      }
    }
  };

  // Handle opening the update modal
  const handleEditEntity = (entity: Event | Issue) => {
    // Set the selected entity and type
    setSelectedEntity(entity);
    setSelectedEntityType('location' in entity ? 'event' : 'issue');
    
    // Open the update modal
    setUpdateModalOpen(true);
  };

  // Handle successful entity update
  const handleEntityUpdated = (updatedEntityId: number) => {
    console.log(`Entity updated with ID: ${updatedEntityId}`);
    
    // Close the modal
    setUpdateModalOpen(false);
    
    // Refresh the data based on entity type
    if (userProfile?.id) {
      if (selectedEntityType === 'event') {
        fetchUserEvents(userProfile.id);
      } else {
        fetchUserIssues(userProfile.id);
      }
    }
  };

  // Handle entity deletion to refresh map pins
  const handleEntityDeleted = (entityType: 'event' | 'issue') => {
    console.log(`Entity of type ${entityType} was deleted`);
    
    // Refresh the data based on entity type
    if (userProfile?.id) {
      if (entityType === 'event') {
        fetchUserEvents(userProfile.id);
      } else {
        fetchUserIssues(userProfile.id);
      }
    }
  };

  // Handle map click event
  const handleMapClick = (position: [number, number]) => {
    // Store the clicked position
    setClickedMapLocation(position);
    
    // Open the create event modal
    setCreateEventModalOpen(true);
  };

  const handleOpenCreateEventModal = () => {
    // Reset the clicked map location when opening modal via button
    setClickedMapLocation(null);
    setCreateEventModalOpen(true);
  };

  const handleCloseCreateEventModal = () => {
    // Clear clicked location when closing modal
    setClickedMapLocation(null);
    setCreateEventModalOpen(false);
  };

  const handleEventCreated = (createdEventId: number) => {
    console.log('Event created with ID:', createdEventId);
    // Refresh the user's events
    if (userProfile?.id) {
      fetchUserEvents(userProfile.id);
    }
    // Clear clicked location
    setClickedMapLocation(null);
  };

  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setShowLocationError(true);
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Store coordinates to pass to the map component
        setUserCoordinates([latitude, longitude]);
        
        // Center map on user location
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 15);
        }
        
        setIsLoadingLocation(false);
      },
      (error) => {
        setIsLoadingLocation(false);
        
        let errorMessage = 'An unknown error occurred';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access was denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        setLocationError(errorMessage);
        setShowLocationError(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleCloseLocationError = () => {
    setShowLocationError(false);
  };

  // Function to determine if user is admin (simplified for now)
  const isUserAdmin = () => {
    // In a real app, this would check user roles or permissions
    return true;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 1
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fire Map
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="large"
              color="inherit"
              aria-label="notifications"
            >
              <NotificationsIcon />
            </IconButton>
            <IconButton
              size="large"
              color="inherit"
              aria-label="account"
            >
              <AccountCircleIcon />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': { width: 240 },
        }}
      >
        <Box sx={{ bgcolor: '#f5f5f5', height: '100%' }}>
          <List>
            <ListItem sx={{ py: 2, justifyContent: 'center' }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Dashboard
              </Typography>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                selected={currentPage === 'dashboard'}
                onClick={() => handlePageChange('dashboard')}
              >
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <LocalFireDepartmentIcon />
                </ListItemIcon>
                <ListItemText primary="Incidents" />
              </ListItemButton>
            </ListItem>
            {isUserAdmin() && (
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentPage === 'admin'}
                  onClick={() => handlePageChange('admin')}
                >
                  <ListItemIcon>
                    <AdminPanelSettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Admin" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
          <Divider />
          <List sx={{ mt: 'auto' }}>
            <ListItem disablePadding>
              <ListItemButton
                selected={currentPage === 'profile'}
                onClick={() => handlePageChange('profile')}
              >
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary="Profil" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
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
      </Drawer>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: '100%',
          bgcolor: '#f9f9f9',
          minHeight: '100vh',
          mt: '64px' // Height of AppBar
        }}
      >
        {currentPage === 'dashboard' ? (
          <>
            {/* Map section */}
            <Box sx={{ position: 'relative', mb: 3, height: 500, borderRadius: 2, overflow: 'hidden' }}>
              {isLoadingEvents ? (
                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)'
                }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>Loading events...</Typography>
                </Box>
              ) : (
                <LocationMap 
                  ref={mapRef}
                  userLocation={userCoordinates}
                  locations={userEvents}
                  center={mapCenter}
                  zoom={11}
                  height="100%"
                  width="100%"
                  onMapClick={handleMapClick}
                />
              )}
              
              {/* Floating Action Button */}
              <Fab
                color="error"
                aria-label="add"
                onClick={handleOpenCreateEventModal}
                sx={{
                  position: 'absolute',
                  left: 20,
                  bottom: 20,
                  zIndex: 1000
                }}
              >
                <AddIcon />
              </Fab>
              
              {/* Map controls */}
              <Box sx={{ 
                position: 'absolute', 
                right: 16, 
                top: '50%', 
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: 'white',
                borderRadius: 2,
                p: 0.5,
                boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
                zIndex: 1000
              }}>
                <IconButton 
                  size="small"
                  onClick={() => mapRef.current?.zoomIn()}
                  aria-label="zoom in"
                >
                  <ZoomInIcon />
                </IconButton>
                <Divider sx={{ my: 0.5 }} />
                <IconButton 
                  size="small"
                  onClick={() => mapRef.current?.zoomOut()}
                  aria-label="zoom out"
                >
                  <ZoomOutIcon />
                </IconButton>
              </Box>

              {/* Location control */}
              <Box sx={{
                position: 'absolute', 
                right: 16, 
                bottom: 16,
                bgcolor: 'white',
                borderRadius: 2,
                p: 0.5,
                boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
                zIndex: 1000
              }}>
                <IconButton 
                  size="small" 
                  onClick={handleGetUserLocation}
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? (
                    <CircularProgress size={24} />
                  ) : (
                    <MyLocationIcon />
                  )}
                </IconButton>
              </Box>
            </Box>
            
            {/* Filters */}
            <Paper 
              elevation={1}
              sx={{ 
                p: 2, 
                mb: 3, 
                borderRadius: 2,
                bgcolor: 'white' 
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>Filters</Typography>
                
                {/* Clear filters button */}
                {(selectedTagId !== null || selectedVehicleId !== null) && (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={clearFilters}
                    color="secondary"
                  >
                    Clear Filters
                  </Button>
                )}
              </Box>
              
              <Grid container spacing={2}>
                {/* Event Tags */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Event Tags</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {isLoadingTags ? (
                      <CircularProgress size={20} />
                    ) : tags.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No tags available</Typography>
                    ) : (
                      tags.map((tag) => (
                        <Chip 
                          key={tag.id}
                          label={tag.name}
                          color={selectedTagId === tag.id ? "primary" : "default"}
                          variant={selectedTagId === tag.id ? "filled" : "outlined"}
                          onClick={() => handleTagFilterClick(tag.id)}
                          size="small"
                          sx={{ borderRadius: 1, m: 0.5 }}
                        />
                      ))
                    )}
                  </Box>
                </Grid>
                
                {/* Vehicle Types - only show for events tab */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Vehicle Types</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {isLoadingVehicleTypes ? (
                      <CircularProgress size={20} />
                    ) : vehicleTypes.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No vehicle types available</Typography>
                    ) : (
                      vehicleTypes.map((vehicle) => (
                        <Chip 
                          key={vehicle.id}
                          label={vehicle.name}
                          color={selectedVehicleId === vehicle.id ? "secondary" : "default"}
                          variant={selectedVehicleId === vehicle.id ? "filled" : "outlined"}
                          onClick={() => handleVehicleFilterClick(vehicle.id)}
                          size="small"
                          sx={{ borderRadius: 1, m: 0.5 }}
                          disabled={activeTab !== 'events'} // Only enable for events tab
                        />
                      ))
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Tabs for Events/Issues */}
            <Box sx={{ mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab 
                  label="Events"
                  value="events"
                  icon={<EventIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Issues" 
                  value="issues" 
                  icon={<FactCheckIcon />} 
                  iconPosition="start"
                />
              </Tabs>
            </Box>
            
            {/* Entity Lists */}
            {activeTab === 'events' && (
              <EntityList
                entityType="event"
                entities={filteredEvents.length > 0 ? filteredEvents : rawEvents}
                isLoading={isLoadingEvents}
                error={eventsError}
                onEntityClick={(entity) => {
                  // Type guard to ensure we only call this for Event types with location
                  if ('location' in entity && entity.location) {
                    handleEntityClick(entity as Event);
                  }
                }}
                onEntityEdit={(entity) => handleEditEntity(entity as Event)}
                onEntityDeleted={() => handleEntityDeleted('event')}
                emptyMessage={
                  selectedTagId || selectedVehicleId
                    ? "No events match the selected filters."
                    : "You haven't created any events yet."
                }
              />
            )}
            
            {activeTab === 'issues' && (
              <EntityList
                entityType="issue"
                entities={filteredIssues.length > 0 ? filteredIssues : issues}
                isLoading={isLoadingIssues}
                error={issuesError}
                onEntityClick={(entity) => handleEntityClick(entity as Issue)}
                onEntityEdit={(entity) => handleEditEntity(entity as Issue)}
                onEntityDeleted={() => handleEntityDeleted('issue')}
                emptyMessage={
                  selectedTagId
                    ? "No issues match the selected filters."
                    : "You haven't created any issues yet."
                }
              />
            )}
          </>
        ) : currentPage === 'admin' ? (
          <AdminPage />
        ) : currentPage === 'profile' ? (
          <ProfilePage />
        ) : null}
      </Box>

      {/* Create Event Modal */}
      <CreateEventModal
        open={createEventModalOpen}
        onClose={handleCloseCreateEventModal}
        onSuccess={handleEventCreated}
        initialLocation={clickedMapLocation}
      />

      {/* Update Entity Modal */}
      <UpdateEntityModal
        open={updateModalOpen}
        entityType={selectedEntityType}
        entity={selectedEntity}
        onClose={() => setUpdateModalOpen(false)}
        onSuccess={handleEntityUpdated}
      />

      {/* Location Error Snackbar */}
      <Snackbar 
        open={showLocationError} 
        autoHideDuration={6000} 
        onClose={handleCloseLocationError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseLocationError} 
          severity="error" 
          variant="filled"
        >
          {locationError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage; 