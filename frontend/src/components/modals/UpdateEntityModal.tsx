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
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [vehicleIds, setVehicleIds] = useState<string[]>([]);
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
    return 'location' in e && 'vehicles' in e;
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
      setTagIds(entity.tag_ids ? entity.tag_ids.map(id => id.toString()) : []);
      
      if (isEvent(entity)) {
        // Extract vehicle IDs from the vehicles array
        setVehicleIds(entity.vehicles ? entity.vehicles.map(v => v.id.toString()) : []);
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

  const handleTagChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setTagIds(typeof value === 'string' ? value.split(',') : value);
  };

  const handleVehicleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setVehicleIds(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSubmit = async () => {
    if (!entity) return;
    
    // Validate form
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (tagIds.length === 0) {
      setError('At least one tag is required');
      return;
    }

    // For events, validate vehicle selection
    if (entityType === 'event' && vehicleIds.length === 0) {
      setError('At least one vehicle type is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (entityType === 'event' && isEvent(entity)) {
        // Update event
        const tagIdsNum = tagIds.map(id => parseInt(id, 10));
        const vehicleIdsNum = vehicleIds.map(id => parseInt(id, 10));
        
        const updatedEventData: Partial<EventUpdate> = {
          name,
          description,
          tag_ids: tagIdsNum,
          vehicle_ids: vehicleIdsNum,
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
        const tagIdsNum = tagIds.map(id => parseInt(id, 10));
        
        const updatedIssueData: Partial<IssueUpdate> = {
          name,
          description,
          tag_ids: tagIdsNum
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
            <InputLabel id="tag-label">Tags</InputLabel>
            <Select
              labelId="tag-label"
              id="tag-select"
              multiple
              value={tagIds}
              onChange={handleTagChange}
              disabled={isLoadingTags}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => {
                    const tag = tags.find(t => t.id.toString() === value);
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
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading tags...
                </MenuItem>
              ) : tags.length === 0 ? (
                <MenuItem disabled>No tags available</MenuItem>
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
              <InputLabel id="vehicle-label">Vehicle Types</InputLabel>
              <Select
                labelId="vehicle-label"
                id="vehicle-select"
                multiple
                value={vehicleIds}
                onChange={handleVehicleChange}
                disabled={isLoadingVehicleTypes}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => {
                      const vehicle = vehicleTypes.find(v => v.id.toString() === value);
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
                {isLoadingVehicleTypes ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading vehicle types...
                  </MenuItem>
                ) : vehicleTypes.length === 0 ? (
                  <MenuItem disabled>No vehicle types available</MenuItem>
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
          
          {entityType === 'event' && location && (
            <TextField
              label="Location"
              fullWidth
              value={`[${location[0].toFixed(6)}, ${location[1].toFixed(6)}]`}
              margin="normal"
              variant="outlined"
              disabled
              helperText="Location cannot be updated"
            />
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              Updating...
            </>
          ) : (
            'Update'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateEntityModal; 