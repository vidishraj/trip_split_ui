import { Box, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';

interface ActionButtonsProps {
  isMobile: boolean;
  onCreateClick: () => void;
  onConnectClick: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isMobile,
  onCreateClick,
  onConnectClick,
}) => {
  return (
    <Box
      display="flex"
      justifyContent="space-around"
      width="50%"
      minWidth="300px"
    >
      <Button
        variant="contained"
        onClick={onCreateClick}
        startIcon={<Add />}
        sx={{
          padding: isMobile ? '10px' : '16px',
          fontSize: isMobile ? '12px' : '16px',
          backgroundColor: '#1976d2',
          color: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            backgroundColor: '#1565c0',
          },
        }}
      >
        Create Trip
      </Button>

      <Button
        variant="contained"
        onClick={onConnectClick}
        startIcon={<ConnectWithoutContactIcon />}
        sx={{
          padding: isMobile ? '10px' : '16px',
          fontSize: isMobile ? '12px' : '16px',
          backgroundColor: '#1976d2',
          color: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            backgroundColor: '#1565c0',
          },
        }}
      >
        Connect Trip
      </Button>
    </Box>
  );
};
