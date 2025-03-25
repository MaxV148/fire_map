import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  Grid,
  Chip,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LabelIcon from '@mui/icons-material/Label';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { createInvite, getAllInvites, deleteInvite, Invite } from '../services/inviteService';
import { createTag, getAllTags, deleteTag, Tag, TagCreate } from '../services/tagService';
import { createVehicleType, getAllVehicleTypes, deleteVehicleType, VehicleType, VehicleTypeCreate } from '../services/vehicleTypeService';
import { formatDistanceToNow } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminPage = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Invite form state
  const [email, setEmail] = useState('');
  const [expireDays, setExpireDays] = useState('7');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  
  // Tag form state
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#3f51b5');
  const [tagDescription, setTagDescription] = useState('');
  const [isSubmittingTag, setIsSubmittingTag] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  
  // Vehicle type form state
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleDescription, setVehicleDescription] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState('');
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [isLoadingVehicleTypes, setIsLoadingVehicleTypes] = useState(false);
  
  // Invites list state
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  
  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | null>(null);
  const [deleteType, setDeleteType] = useState<'invite' | 'tag' | 'vehicle'>('invite');
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Load data on component mount
  useEffect(() => {
    fetchInvites();
    fetchTags();
    fetchVehicleTypes();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const fetchInvites = async () => {
    setIsLoadingInvites(true);
    try {
      const data = await getAllInvites();
      setInvites(data.invites);
    } catch (error) {
      console.error('Failed to fetch invites:', error);
      showSnackbar('Failed to load invites', 'error');
    } finally {
      setIsLoadingInvites(false);
    }
  };

  const fetchTags = async () => {
    setIsLoadingTags(true);
    try {
      const fetchedTags = await getAllTags();
      setTags(fetchedTags);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      showSnackbar('Failed to load tags', 'error');
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
      console.error('Failed to fetch vehicle types:', error);
      showSnackbar('Failed to load vehicle types', 'error');
    } finally {
      setIsLoadingVehicleTypes(false);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      showSnackbar('Please enter an email address', 'error');
      return;
    }
    
    setIsSubmittingInvite(true);
    
    try {
      await createInvite({
        email,
        expire_days: parseInt(expireDays, 10)
      });
      
      showSnackbar('Invitation sent successfully', 'success');
      
      // Reset form
      setEmail('');
      setExpireDays('7');
      
      // Refresh invites list
      fetchInvites();
    } catch (error: any) {
      console.error('Error creating invite:', error);
      const errorMessage = error.message || 'Failed to send invitation';
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tagName.trim()) {
      showSnackbar('Please enter a tag name', 'error');
      return;
    }
    
    setIsSubmittingTag(true);
    
    try {
      const tagData: TagCreate = {
        name: tagName,
        color: tagColor,
        description: tagDescription || undefined
      };
      
      await createTag(tagData);
      showSnackbar('Tag created successfully', 'success');
      
      // Reset form
      setTagName('');
      setTagColor('#3f51b5');
      setTagDescription('');
      
      // Refresh tags list
      fetchTags();
    } catch (error: any) {
      console.error('Error creating tag:', error);
      const errorMessage = error.message || 'Failed to create tag';
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsSubmittingTag(false);
    }
  };

  const handleCreateVehicleType = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicleName.trim()) {
      showSnackbar('Please enter a vehicle type name', 'error');
      return;
    }
    
    setIsSubmittingVehicle(true);
    
    try {
      const vehicleData: VehicleTypeCreate = {
        name: vehicleName,
        description: vehicleDescription || undefined,
        capacity: vehicleCapacity ? parseInt(vehicleCapacity, 10) : undefined
      };
      
      await createVehicleType(vehicleData);
      showSnackbar('Vehicle type created successfully', 'success');
      
      // Reset form
      setVehicleName('');
      setVehicleDescription('');
      setVehicleCapacity('');
      
      // Refresh vehicle types list
      fetchVehicleTypes();
    } catch (error: any) {
      console.error('Error creating vehicle type:', error);
      const errorMessage = error.message || 'Failed to create vehicle type';
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsSubmittingVehicle(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!selectedTag) return;
    
    try {
      await deleteTag(selectedTag.id);
      showSnackbar('Tag deleted successfully', 'success');
      
      // Refresh tags list
      fetchTags();
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      const errorMessage = error.message || 'Failed to delete tag';
      showSnackbar(errorMessage, 'error');
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleDeleteVehicleType = async () => {
    if (!selectedVehicleType) return;
    
    try {
      await deleteVehicleType(selectedVehicleType.id);
      showSnackbar('Vehicle type deleted successfully', 'success');
      
      // Refresh vehicle types list
      fetchVehicleTypes();
    } catch (error: any) {
      console.error('Error deleting vehicle type:', error);
      const errorMessage = error.message || 'Failed to delete vehicle type';
      showSnackbar(errorMessage, 'error');
    } finally {
      handleCloseDeleteDialog();
    }
  };
  
  const handleOpenDeleteDialog = (type: 'invite' | 'tag' | 'vehicle', item: Invite | Tag | VehicleType) => {
    setDeleteType(type);
    
    if (type === 'invite') {
      setSelectedInvite(item as Invite);
    } else if (type === 'tag') {
      setSelectedTag(item as Tag);
    } else if (type === 'vehicle') {
      setSelectedVehicleType(item as VehicleType);
    }
    
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedInvite(null);
    setSelectedTag(null);
    setSelectedVehicleType(null);
  };
  
  const handleDeleteInvite = async () => {
    if (!selectedInvite) return;
    
    try {
      await deleteInvite(selectedInvite.invite_uuid);
      showSnackbar('Invitation deleted successfully', 'success');
      
      // Refresh invites list
      fetchInvites();
    } catch (error: any) {
      console.error('Error deleting invite:', error);
      const errorMessage = error.message || 'Failed to delete invitation';
      showSnackbar(errorMessage, 'error');
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleDelete = async () => {
    switch (deleteType) {
      case 'invite':
        await handleDeleteInvite();
        break;
      case 'tag':
        await handleDeleteTag();
        break;
      case 'vehicle':
        await handleDeleteVehicleType();
        break;
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Get delete dialog content based on type
  const getDeleteDialogContent = () => {
    switch (deleteType) {
      case 'invite':
        return {
          title: 'Delete Invitation',
          content: `Are you sure you want to delete the invitation for ${selectedInvite?.email}?`
        };
      case 'tag':
        return {
          title: 'Delete Tag',
          content: `Are you sure you want to delete the tag "${selectedTag?.name}"?`
        };
      case 'vehicle':
        return {
          title: 'Delete Vehicle Type',
          content: `Are you sure you want to delete the vehicle type "${selectedVehicleType?.name}"?`
        };
    }
  };

  const dialogContent = getDeleteDialogContent();

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <AdminPanelSettingsIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
      </Box>
      
      {/* Tabs */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="admin tabs">
            <Tab 
              icon={<PersonAddIcon />} 
              iconPosition="start" 
              label="User Invitations" 
              id="admin-tab-0" 
              aria-controls="admin-tabpanel-0" 
            />
            <Tab 
              icon={<LabelIcon />} 
              iconPosition="start" 
              label="Tags" 
              id="admin-tab-1" 
              aria-controls="admin-tabpanel-1" 
            />
            <Tab 
              icon={<DirectionsBusIcon />} 
              iconPosition="start" 
              label="Vehicle Types" 
              id="admin-tab-2" 
              aria-controls="admin-tabpanel-2" 
            />
          </Tabs>
        </Box>
        
        {/* User Invitations Tab */}
        <TabPanel value={activeTab} index={0}>
          {/* Invite User Form */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Invite New User
            </Typography>
            
            <form onSubmit={handleCreateInvite}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                <TextField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  placeholder="user@example.com"
                  variant="outlined"
                  autoComplete="off"
                />
                
                <TextField
                  label="Expire Days"
                  type="number"
                  value={expireDays}
                  onChange={(e) => setExpireDays(e.target.value)}
                  sx={{ width: { xs: '100%', sm: '200px' } }}
                  inputProps={{ min: 1, max: 30 }}
                />
              </Box>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmittingInvite}
                sx={{ px: 4 }}
              >
                {isSubmittingInvite ? (
                  <CircularProgress size={24} color="inherit" />
                ) : 'Send Invitation'}
              </Button>
            </form>
          </Paper>
          
          {/* Invites List */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Active Invitations
            </Typography>
            
            {isLoadingInvites ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : invites.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
                No active invitations
              </Typography>
            ) : (
              <List>
                {invites.map((invite, index) => (
                  <Box key={invite.id}>
                    <ListItem
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleOpenDeleteDialog('invite', invite)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={invite.email}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {invite.is_used ? 'Used' : 'Not used yet'}
                            </Typography>
                            {' • '}
                            <Typography component="span" variant="body2">
                              Expires {formatDistanceToNow(new Date(invite.expire_date), { addSuffix: true })}
                            </Typography>
                            {' • '}
                            <Typography component="span" variant="body2">
                              Created {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < invites.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </TabPanel>
        
        {/* Tags Tab */}
        <TabPanel value={activeTab} index={1}>
          {/* Create Tag Form */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Create New Tag
            </Typography>
            
            <form onSubmit={handleCreateTag}>
              <Grid container spacing={2}>
                  <TextField
                    label="Tag Name"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                    autoComplete="off"
                  />
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmittingTag}
                  sx={{ px: 4 }}
                >
                  {isSubmittingTag ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : 'Create Tag'}
                </Button>
              </Box>
            </form>
          </Paper>
          
          {/* Tags List */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Existing Tags
            </Typography>
            
            {isLoadingTags ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : tags.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
                No tags created yet
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {tags.map((tag) => (
                  <Grid item key={tag.id}>
                    <Chip
                      label={tag.name}
                      sx={{ 
                        bgcolor: tag.color,
                        '& .MuiChip-deleteIcon': {
                          color: 'inherit',
                          opacity: 0.7,
                          '&:hover': { opacity: 1 }
                        }
                      }}
                      onDelete={() => handleOpenDeleteDialog('tag', tag)}
                      title={tag.description || ''}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </TabPanel>
        
        {/* Vehicle Types Tab */}
        <TabPanel value={activeTab} index={2}>
          {/* Create Vehicle Type Form */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Create New Vehicle Type
            </Typography>
            
            <form onSubmit={handleCreateVehicleType}>
              <Grid container>
                  <TextField
                    label="Vehicle Type Name"
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                    autoComplete="off"
                  />
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmittingVehicle}
                  sx={{ px: 4 }}
                >
                  {isSubmittingVehicle ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : 'Create Vehicle Type'}
                </Button>
              </Box>
            </form>
          </Paper>
          
          {/* Vehicle Types List */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Existing Vehicle Types
            </Typography>
            
            {isLoadingVehicleTypes ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : vehicleTypes.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
                No vehicle types created yet
              </Typography>
            ) : (
              <List>
                {vehicleTypes.map((vehicle, index) => (
                  <Box key={vehicle.id}>
                    <ListItem
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleOpenDeleteDialog('vehicle', vehicle)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DirectionsBusIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                            {vehicle.name} 
                            {vehicle.capacity && (
                              <Chip 
                                label={`Capacity: ${vehicle.capacity}`} 
                                size="small" 
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={vehicle.description}
                      />
                    </ListItem>
                    {index < vehicleTypes.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </TabPanel>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>{dialogContent.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogContent.content}
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPage; 