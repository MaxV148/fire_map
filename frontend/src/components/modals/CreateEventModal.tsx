import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  InputAdornment,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { authService } from '../../services/authService';

interface Tag {
  id: number;
  name: string;
}

interface VehicleType {
  id: number;
  name: string;
}

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (createdEventId: number) => void;
  initialLocation?: [number, number] | null;
  initialFormType?: FormType;
}

export interface EventFormData {
  name: string;
  description: string;
  location: [number, number] | null;
  tag_ids: number[];
  vehicle_ids: number[];
}

export interface IssueFormData {
  name: string;
  description: string;
  tag_ids: number[];
  location: [number, number] | null;
}

type FormType = 'event' | 'issue';

const initialEventFormData: EventFormData = {
  name: '',
  description: '',
  location: null,
  tag_ids: [],
  vehicle_ids: []
};

const initialIssueFormData: IssueFormData = {
  name: '',
  description: '',
  tag_ids: [],
  location: null
};

const CreateEventModal = ({ open, onClose, onSuccess, initialLocation, initialFormType }: CreateEventModalProps) => {
  const [formType, setFormType] = useState<FormType>(initialFormType || 'event');
  const [eventFormData, setEventFormData] = useState<EventFormData>(initialEventFormData);
  const [issueFormData, setIssueFormData] = useState<IssueFormData>(initialIssueFormData);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [locationDisplayText, setLocationDisplayText] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (open) {
      // Reset errors when reopening the modal
      setApiError(null);
      
      // Check if authenticated before making API calls
      if (!authService.isAuthenticated()) {
        setApiError('Authentication required. Please log in to create events or issues.');
        return;
      }
      
      fetchTags();
      fetchVehicleTypes();
    }
  }, [open]);

  // Handle initialLocation when provided
  useEffect(() => {
    if (initialLocation && open) {
      // Convert from [lat, lng] to [lng, lat] format expected by the backend
      const [lat, lng] = initialLocation;
      const backendLocation: [number, number] = [lng, lat];
      
      // Set the location in the form data
      setEventFormData(prevData => ({
        ...prevData,
        location: backendLocation
      }));
      
      // Format the location for display
      setLocationDisplayText(`[${lng.toFixed(6)}, ${lat.toFixed(6)}]`);
    }
  }, [initialLocation, open]);

  // Aktualisiere formType, wenn initialFormType sich ändert
  useEffect(() => {
    if (initialFormType) {
      setFormType(initialFormType);
    }
  }, [initialFormType]);

  const fetchTags = async () => {
    setIsLoadingTags(true);
    setApiError(null);
    try {
      const response = await fetch('http://localhost:8000/v1/tag', {
        headers: {
          ...authService.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      } else if (response.status === 401) {
        setApiError('Authentication expired. Please log in again.');
        authService.logout(); // Force logout if token is invalid
      } else {
        console.error('Failed to fetch tags');
        setApiError('Failed to load tags. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      setApiError('Network error. Please check your connection.');
    } finally {
      setIsLoadingTags(false);
    }
  };

  const fetchVehicleTypes = async () => {
    setIsLoadingVehicles(true);
    try {
      const response = await fetch('http://localhost:8000/v1/vehicle', {
        headers: {
          ...authService.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVehicleTypes(data);
      } else if (response.status === 401) {
        setApiError('Authentication expired. Please log in again.');
        authService.logout(); // Force logout if token is invalid
      } else {
        console.error('Failed to fetch vehicle types');
        setApiError('Failed to load vehicle types. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching vehicle types:', error);
      setApiError('Network error. Please check your connection.');
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleIssueFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setIssueFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleEventSelectChange = (e: any) => {
    const { name, value } = e.target;
    if (name === 'tag_ids' || name === 'vehicle_ids') {
      setEventFormData(prevData => ({
        ...prevData,
        [name]: value as number[]
      }));
    } else {
      setEventFormData(prevData => ({
        ...prevData,
        [name]: value === '' ? null : Number(value)
      }));
    }
  };

  const handleIssueSelectChange = (e: any) => {
    const { name, value } = e.target;
    if (name === 'tag_ids') {
      setIssueFormData(prevData => ({
        ...prevData,
        tag_ids: value as number[]
      }));
    } else {
      setIssueFormData(prevData => ({
        ...prevData,
        [name]: value === '' ? null : Number(value)
      }));
    }
  };

  const handleFormTypeChange = (e: any) => {
    setFormType(e.target.value);
  };

  const handleSubmit = async () => {
    // Check if user is authenticated before proceeding
    if (!authService.isAuthenticated()) {
      setApiError('Authentication required. Please log in to create events or issues.');
      return;
    }
    
    setApiError(null);
    setIsSubmitting(true);
    
    try {
      // Get the current user for created_by field
      const user = authService.getUserProfile();
      
      if (!user) {
        setApiError('User profile not found. Please log in again.');
        setIsSubmitting(false);
        return;
      }
      
      if (formType === 'event') {
        // Create event data object according to the backend structure
        const eventData = {
          name: eventFormData.name,
          description: eventFormData.description,
          location: eventFormData.location,
          tag_ids: eventFormData.tag_ids,
          vehicle_ids: eventFormData.vehicle_ids,
          created_by: user.id
        };
        
        // Send POST request to the backend with authentication token in header
        const response = await fetch('http://localhost:8000/v1/event', {
          method: 'POST',
          headers: {
            ...authService.getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventData)
        });
        
        if (response.status === 401) {
          // Use the centralized method to handle token expiration
          authService.handleUnauthorized();
          return;
        }
        
        if (response.ok) {
          const createdEvent = await response.json();
          console.log('Event created successfully:', createdEvent);
          
          // Set success message and show alert
          setSuccessMessage('Event created successfully!');
          setShowSuccessAlert(true);
          
          // Reset form
          setEventFormData(initialEventFormData);
          setLocationDisplayText('');
          
          // Call onSuccess callback if provided
          if (onSuccess && createdEvent.id) {
            onSuccess(createdEvent.id);
          }
          
          // Close modal after a short delay
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setApiError(errorData.detail || 'Failed to create event. Please try again.');
        }
      } else {
        // Create issue data object according to the backend structure
        const issueData = {
          name: issueFormData.name,
          description: issueFormData.description,
          tag_ids: issueFormData.tag_ids,
          location: issueFormData.location
        };
        
        // Send POST request to the backend with authentication token in header
        const response = await fetch('http://localhost:8000/v1/issue', {
          method: 'POST',
          headers: {
            ...authService.getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(issueData)
        });
        
        if (response.status === 401) {
          // Use the centralized method to handle token expiration
          authService.handleUnauthorized();
          return;
        }
        
        if (response.ok) {
          const createdIssue = await response.json();
          console.log('Issue created successfully:', createdIssue);
          
          // Set success message and show alert
          setSuccessMessage('Issue created successfully!');
          setShowSuccessAlert(true);
          
          // Reset form
          setIssueFormData(initialIssueFormData);
          
          // Call onSuccess callback if provided
          if (onSuccess && createdIssue.id) {
            onSuccess(createdIssue.id);
          }
          
          // Close modal after a short delay
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setApiError(errorData.detail || 'Failed to create issue. Please try again.');
        }
      }
    } catch (error) {
      console.error(`Error submitting ${formType}:`, error);
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEventFormData(initialEventFormData);
    setIssueFormData(initialIssueFormData);
    setLocationDisplayText('');
    onClose();
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      setLocationError(null);
      
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          
          // Format the location text for display
          setLocationDisplayText(`[${longitude.toFixed(6)}, ${latitude.toFixed(6)}]`);
          
          try {
            // Set the coordinates in the form data as [longitude, latitude] to match backend
            if (formType === 'event') {
              setEventFormData(prevData => ({
                ...prevData,
                location: [longitude, latitude]
              }));
            } else {
              setIssueFormData(prevData => ({
                ...prevData,
                location: [longitude, latitude]
              }));
            }
            setIsLoadingLocation(false);
          } catch (error: unknown) {
            console.error('Error processing location:', error);
            setLocationError('Failed to process location data');
            setIsLoadingLocation(false);
          }
        },
        
        (error: GeolocationPositionError) => {
          setIsLoadingLocation(false);
          switch(error.code) {
            case error.PERMISSION_DENIED:
              setLocationError('Location access was denied');
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError('Location information is unavailable');
              break;
            case error.TIMEOUT:
              setLocationError('Location request timed out');
              break;
            default:
              setLocationError('An unknown error occurred');
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser');
    }
  };

  const handleCloseSuccessAlert = () => {
    setShowSuccessAlert(false);
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Create New {formType === 'event' ? 'Event' : 'Issue'}</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {apiError && (
            <Box sx={{ 
              mb: 2, 
              p: 1, 
              bgcolor: 'error.light', 
              color: 'error.contrastText',
              borderRadius: 1
            }}>
              <Typography variant="body2">{apiError}</Typography>
            </Box>
          )}
          
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="form-type-label">Item Type</InputLabel>
              <Select
                labelId="form-type-label"
                id="form-type"
                value={formType}
                label="Item Type"
                onChange={handleFormTypeChange}
              >
                <MenuItem value="event">Event</MenuItem>
                <MenuItem value="issue">Issue</MenuItem>
              </Select>
            </FormControl>
            
            {formType === 'event' ? (
              // Event form fields
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Event Name"
                  name="name"
                  value={eventFormData.name}
                  onChange={handleEventFormChange}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="description"
                  label="Event Description"
                  name="description"
                  multiline
                  rows={3}
                  value={eventFormData.description}
                  onChange={handleEventFormChange}
                />
                
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="tag-label">Event Tags</InputLabel>
                  <Select
                    labelId="tag-label"
                    id="tag_ids"
                    name="tag_ids"
                    multiple
                    value={eventFormData.tag_ids}
                    label="Event Tags"
                    onChange={handleEventSelectChange}
                    disabled={isLoadingTags || tags.length === 0}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as number[]).map((value) => {
                          const tag = tags.find(tag => tag.id === value);
                          return (
                            <Chip
                              key={value}
                              label={tag?.name}
                              size="small"
                              color="primary"
                              sx={{
                                m: 0.25,
                                borderRadius: '16px',
                                '& .MuiChip-label': {
                                  px: 1,
                                }
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {isLoadingTags ? (
                      <MenuItem value="">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading tags...
                        </Box>
                      </MenuItem>
                    ) : tags.length === 0 ? (
                      <MenuItem value="">No tags available</MenuItem>
                    ) : (
                      tags.map((tag) => (
                        <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="vehicle-label">Vehicle Types</InputLabel>
                  <Select
                    labelId="vehicle-label"
                    id="vehicle_ids"
                    name="vehicle_ids"
                    multiple
                    value={eventFormData.vehicle_ids}
                    label="Vehicle Types"
                    onChange={handleEventSelectChange}
                    disabled={isLoadingVehicles || vehicleTypes.length === 0}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as number[]).map((value) => {
                          const vehicle = vehicleTypes.find(vt => vt.id === value);
                          return (
                            <Chip
                              key={value}
                              label={vehicle?.name}
                              size="small"
                              color="secondary"
                              sx={{
                                m: 0.25,
                                borderRadius: '16px',
                                '& .MuiChip-label': {
                                  px: 1,
                                }
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {isLoadingVehicles ? (
                      <MenuItem value="">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading vehicle types...
                        </Box>
                      </MenuItem>
                    ) : vehicleTypes.length === 0 ? (
                      <MenuItem value="">No vehicle types available</MenuItem>
                    ) : (
                      vehicleTypes.map((vt) => (
                        <MenuItem key={vt.id} value={vt.id}>{vt.name}</MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="location"
                  label="Location"
                  value={locationDisplayText}
                  disabled
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Get my current location">
                          <IconButton 
                            edge="end" 
                            onClick={getUserLocation}
                            disabled={isLoadingLocation}
                          >
                            {isLoadingLocation ? (
                              <CircularProgress size={24} />
                            ) : (
                              <MyLocationIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  helperText={locationError || "Use the location button to set your current coordinates"}
                  error={!!locationError}
                />
              </>
            ) : (
              // Issue form fields
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Issue Name"
                  name="name"
                  value={issueFormData.name}
                  onChange={handleIssueFormChange}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="description"
                  label="Issue Description"
                  name="description"
                  multiline
                  rows={3}
                  value={issueFormData.description}
                  onChange={handleIssueFormChange}
                />
                
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="issue-tag-label">Issue Tags</InputLabel>
                  <Select
                    labelId="issue-tag-label"
                    id="tag_ids"
                    name="tag_ids"
                    multiple
                    value={issueFormData.tag_ids}
                    label="Issue Tags"
                    onChange={handleIssueSelectChange}
                    disabled={isLoadingTags || tags.length === 0}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as number[]).map((value) => {
                          const tag = tags.find(tag => tag.id === value);
                          return (
                            <Chip
                              key={value}
                              label={tag?.name}
                              size="small"
                              color="primary"
                              sx={{
                                m: 0.25,
                                borderRadius: '16px',
                                '& .MuiChip-label': {
                                  px: 1,
                                }
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {isLoadingTags ? (
                      <MenuItem value="">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading tags...
                        </Box>
                      </MenuItem>
                    ) : tags.length === 0 ? (
                      <MenuItem value="">No tags available</MenuItem>
                    ) : (
                      tags.map((tag) => (
                        <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="location"
                  label="Location"
                  value={locationDisplayText}
                  disabled
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Get my current location">
                          <IconButton 
                            edge="end" 
                            onClick={getUserLocation}
                            disabled={isLoadingLocation}
                          >
                            {isLoadingLocation ? (
                              <CircularProgress size={24} />
                            ) : (
                              <MyLocationIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  helperText={locationError || "Use the location button to set your current coordinates"}
                  error={!!locationError}
                />
              </>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCancel} color="inherit" disabled={isSubmitting}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="error"
            disabled={
              isSubmitting ||
              (formType === 'event' ? (
                !eventFormData.name || 
                !eventFormData.description || 
                !eventFormData.location ||
                eventFormData.tag_ids.length === 0 ||
                eventFormData.vehicle_ids.length === 0
              ) : (
                !issueFormData.name || 
                !issueFormData.description || 
                !issueFormData.location ||
                issueFormData.tag_ids.length === 0
              ))
            }
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                Creating...
              </>
            ) : (
              `Create ${formType === 'event' ? 'Event' : 'Issue'}`
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={showSuccessAlert}
        autoHideDuration={6000}
        onClose={handleCloseSuccessAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccessAlert} severity="success" variant="filled">
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateEventModal; 