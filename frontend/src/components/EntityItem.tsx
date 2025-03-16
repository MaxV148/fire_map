import { 
  Box, 
  Typography, 
  Paper, 
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Event } from '../services/eventService';
import { Issue } from '../services/issueService';
import { format, parseISO } from 'date-fns';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// Union type for the entities this component can display
type Entity = Event | Issue;

interface EntityItemProps {
  entity: Entity;
  entityType: 'event' | 'issue';
  onClick?: (entity: Entity) => void;
  onDelete?: (entity: Entity) => void;
  onEdit?: (entity: Entity) => void;
}

const EntityItem = ({ entity, entityType, onClick, onDelete, onEdit }: EntityItemProps) => {
  // Type guard to check if entity is an Event
  const isEvent = (entity: Entity): entity is Event => {
    return (entity as Event).location !== undefined;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Unknown date';
    }
  };

  // Handle delete click and prevent event bubbling
  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(entity);
    }
  };

  // Handle edit click and prevent event bubbling
  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(entity);
    }
  };

  return (
    <Paper 
      sx={{ 
        p: 2, 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { 
          boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        } : {}
      }}
      onClick={() => onClick && onClick(entity)}
    >
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {entity.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created on {formatDate(entity.created_at)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={entityType === 'event' ? 'Event' : 'Issue'} 
              color={entityType === 'event' ? 'primary' : 'secondary'}
              size="small"
            />
            {onEdit && (
              <Tooltip title={`Edit ${entityType}`}>
                <IconButton 
                  size="small" 
                  color="primary" 
                  onClick={handleEditClick}
                  aria-label={`edit ${entityType}`}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title={`Delete ${entityType}`}>
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={handleDeleteClick}
                  aria-label={`delete ${entityType}`}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          {entity.description || 'No description provided'}
        </Typography>
        
        {isEvent(entity) && entity.location && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Location: {entity.location[1].toFixed(4)}, {entity.location[0].toFixed(4)}
            </Typography>
          </Box>
        )}
        
        {/* Tag display if available */}
        {entity.tag_id && (
          <Chip 
            label={`Tag ID: ${entity.tag_id}`} 
            size="small"
            variant="outlined"
            sx={{ mt: 1 }}
          />
        )}
      </Box>
    </Paper>
  );
};

export default EntityItem; 