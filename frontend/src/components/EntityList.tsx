import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Skeleton,
  Alert,
  Pagination,
  Button,
  Chip,
  Snackbar
} from '@mui/material';
import { Event, deleteEvent } from '../services/eventService';
import { Issue, deleteIssue } from '../services/issueService';
import { format, parseISO } from 'date-fns';
import EventIcon from '@mui/icons-material/Event';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import EntityItem from './EntityItem';
import CreateEventModal from './modals/CreateEventModal';

// Define the possible entity types this component can handle
type EntityType = 'event' | 'issue';

// Union type for the entities this component can display
type Entity = Event | Issue;

interface EntityListProps {
  entityType: EntityType;
  entities: Entity[];
  isLoading: boolean;
  error: string | null;
  title?: string;
  onEntityClick?: (entity: Entity) => void;
  onEntityEdit?: (entity: Entity) => void;
  emptyMessage?: string;
  itemsPerPage?: number;
  onEntityDeleted?: () => void; // Callback for when an entity is deleted
}

const EntityList = ({
  entityType,
  entities,
  isLoading,
  error,
  title = '',
  onEntityClick,
  onEntityEdit,
  emptyMessage = `No ${entityType}s found`,
  itemsPerPage = 5,
  onEntityDeleted
}: EntityListProps) => {
  const [page, setPage] = useState(1);
  const [deletingEntityId, setDeletingEntityId] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [localEntities, setLocalEntities] = useState<Entity[]>(entities);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormType, setSelectedFormType] = useState<'event' | 'issue'>('event');

  // Update local entities when the prop changes
  useEffect(() => {
    setLocalEntities(entities);
  }, [entities]);

  // Pagination logic
  const totalPages = Math.ceil(localEntities.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntities = localEntities.slice(startIndex, endIndex);

  // Adjust page if current page becomes empty after deletion
  useEffect(() => {
    if (page > 1 && startIndex >= localEntities.length) {
      setPage(Math.max(1, Math.ceil(localEntities.length / itemsPerPage)));
    }
  }, [localEntities, page, itemsPerPage, startIndex]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Unknown date';
    }
  };

  // Handle entity deletion
  const handleDeleteEntity = async (entity: Entity) => {
    setDeletingEntityId(entity.id);
    
    let success = false;
    try {
      if (entityType === 'event') {
        success = await deleteEvent(entity.id);
      } else {
        success = await deleteIssue(entity.id);
      }
      
      if (success) {
        // Update local entities immediately for better UX
        setLocalEntities(prevEntities => 
          prevEntities.filter(e => e.id !== entity.id)
        );
        
        setSnackbarMessage(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} deleted successfully`);
        
        // Call the callback to refresh data in the parent component
        if (onEntityDeleted) {
          onEntityDeleted();
        }
      } else {
        setSnackbarMessage(`Failed to delete ${entityType}`);
      }
    } catch (error) {
      setSnackbarMessage(`Error deleting ${entityType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingEntityId(null);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleOpenModal = (type: 'event' | 'issue') => {
    setSelectedFormType(type);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleEntityCreated = (entityId: number) => {
    // Callback für nach der Erstellung einer Entität
    if (onEntityDeleted) {
      // Wiederverwendung des onEntityDeleted-Callbacks für die Aktualisierung der Daten
      onEntityDeleted();
    }
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Grid container spacing={2}>
          {[...Array(3)].map((_, index) => (
            <Grid item xs={12} key={index}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Skeleton variant="text" width={250} height={32} />
                    <Skeleton variant="text" width={150} />
                  </Box>
                  <Skeleton variant="text" width={100} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Render empty state
  if (localEntities.length === 0) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {emptyMessage}
          </Typography>
          {entityType === 'event' && (
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<EventIcon />}
              onClick={() => handleOpenModal('event')}
            >
              Create New Event
            </Button>
          )}
          {entityType === 'issue' && (
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<FactCheckIcon />}
              onClick={() => handleOpenModal('issue')}
            >
              Report New Issue
            </Button>
          )}
        </Paper>
        {/* Modal-Komponente */}
        <CreateEventModal 
          open={modalOpen} 
          onClose={handleCloseModal}
          onSuccess={handleEntityCreated}
          initialFormType={selectedFormType}
        />
      </Box>
    );
  }

  // Render the list
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {paginatedEntities.map((entity) => (
          <Grid item xs={12} key={entity.id}>
            <EntityItem 
              entity={entity} 
              entityType={entityType} 
              onClick={onEntityClick}
              onDelete={handleDeleteEntity}
              onEdit={onEntityEdit}
            />
          </Grid>
        ))}
      </Grid>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
      
      {/* Modal-Komponente auch im normalen Render-Fall */}
      <CreateEventModal 
        open={modalOpen} 
        onClose={handleCloseModal} 
        onSuccess={handleEntityCreated}
        initialFormType={selectedFormType}
      />
    </Box>
  );
};

export default EntityList; 