import { ReactNode } from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface DashboardWidgetProps {
  title: string;
  children: ReactNode;
  height?: number | string;
  fullWidth?: boolean;
}

const DashboardWidget = ({ 
  title, 
  children, 
  height = 240, 
  fullWidth = false 
}: DashboardWidgetProps) => {
  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height,
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Paper>
  );
};

export default DashboardWidget; 