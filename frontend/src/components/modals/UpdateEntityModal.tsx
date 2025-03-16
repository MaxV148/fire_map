import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import { Event, EventUpdate } from '../../services/eventService';
import { Issue, IssueUpdate } from '../../services/issueService';
import { getAllTags, Tag } from '../../services/tagService';
import { getAllVehicleTypes, VehicleType } from '../../services/vehicleTypeService';
import { updateEvent } from '../../services/eventService';
import { updateIssue } from '../../services/issueService';

// Define props for modal
interface UpdateEntityModalProps {
  open: boolean;
  entityType: 'event' | 'issue';
  entity: Event | Issue | null;
  onClose: () => void;
  onSuccess: (updatedEntityId: number) => void;
}

const UpdateEntityModal = ({ open, entityType, entity, onClose, onSuccess }: UpdateEntityModalProps) => {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagId, setTagId] = useState<string>('');
  const [vehicleId, setVehicleId] = useState<string>('');
  const [location, setLocation] = useState<number[] | undefined>(undefined);
  
  // Options for dropdowns
  const [tags, setTags] = useState<Tag[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  
  // Loading and error states
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isLoadingVehicleTypes, setIsLoadingVehicleTypes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if the entity is an Event
  const isEvent = (e: any): e is Event => {
    return 'location' in e && 'vehicle_id' in e;
  };

  // Fetch tags and vehicle types on mount
  useEffect(() => {
    if (open) {
      fetchTags();
      if (entityType === 'event') {
        fetchVehicleTypes();
      }
    }
  }, [open, entityType]);

  // Set form values when entity changes
  useEffect(() => {
    if (entity) {
      setName(entity.name);
      setDescription(entity.description || '');
      setTagId(entity.tag_id ? entity.tag_id.toString() : '');
      
      if (isEvent(entity)) {
        setVehicleId(entity.vehicle_id ? entity.vehicle_id.toString() : '');
        setLocation(entity.location);
      }
    }
  }, [entity]);

  const fetchTags = async () => {
    setIsLoadingTags(true);
    try {
      const fetchedTags = await getAllTags();
      setTags(fetchedTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setError('Failed to load tags. Please try again.');
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
      console.error('Error fetching vehicle types:', error);
      setError('Failed to load vehicle types. Please try again.');
    } finally {
      setIsLoadingVehicleTypes(false);
    }
  };

  const handleTagChange = (event: SelectChangeEvent) => {
    setTagId(event.target.value);
  };

  const handleVehicleChange = (event: SelectChangeEvent) => {
    setVehicleId(event.target.value);
  };

  const handleSubmit = async () => {
    if (!entity) return;
    
    // Validate form
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (entityType === 'event' && isEvent(entity)) {
        // Update event
        const tagIdNum = tagId ? parseInt(tagId, 10) : undefined;
        const vehicleIdNum = vehicleId ? parseInt(vehicleId, 10) : undefined;
        
        const updatedEventData: Partial<EventUpdate> = {
          name,
          description,
          tag_id: tagIdNum,
          vehicle_id: vehicleIdNum,
          location
        };
        
        const success = await updateEvent(entity.id, updatedEventData);
        if (success) {
          onSuccess(entity.id);
        } else {
          setError('Failed to update event. Please try again.');
        }
      } else {
        // Update issue
        const tagIdNum = tagId ? parseInt(tagId, 10) : undefined;
        
        const updatedIssueData: Partial<IssueUpdate> = {
          name,
          description,
          tag_id: tagIdNum
        };
        
        const success = await updateIssue(entity.id, updatedIssueData);
        if (success) {
          onSuccess(entity.id);
        } else {
          setError('Failed to update issue. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error updating entity:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clear form and errors when closing
    setError(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {`Update ${entityType === 'event' ? 'Event' : 'Issue'}`}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Box sx={{ mt: 1 }}>
          <TextField
            label="Name"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="tag-select-label">Tag</InputLabel>
            <Select
              labelId="tag-select-label"
              value={tagId}
              onChange={handleTagChange}
              label="Tag"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {isLoadingTags ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                  <Typography sx={{ ml: 1 }}>Loading tags...</Typography>
                </MenuItem>
              ) : (
                tags.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id.toString()}>
                    {tag.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          
          {entityType === 'event' && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="vehicle-select-label">Vehicle Type</InputLabel>
              <Select
                labelId="vehicle-select-label"
                value={vehicleId}
                onChange={handleVehicleChange}
                label="Vehicle Type"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {isLoadingVehicleTypes ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                    <Typography sx={{ ml: 1 }}>Loading vehicle types...</Typography>
                  </MenuItem>
                ) : (
                  vehicleTypes.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}
          
          {/* Note: Location updating would typically require a map component */}
          {entityType === 'event' && location && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Location
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Latitude: {location[1]}, Longitude: {location[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (To update location, please create a new event)
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Updating...' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateEntityModal; 