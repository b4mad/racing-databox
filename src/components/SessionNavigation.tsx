import { Modal, Box, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { SessionData } from '../services/types';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface SessionNavigationProps {
  open: boolean;
  onClose: () => void;
  sessionData: SessionData | null;
  onLapSelect: (lap: number) => void;
  currentLap: number;
}

export const SessionNavigation = ({ 
  open, 
  onClose, 
  sessionData, 
  onLapSelect,
  currentLap 
}: SessionNavigationProps) => {
  if (!sessionData) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="session-navigation-modal"
    >
      <Box sx={style}>
        <Typography id="session-navigation-modal" variant="h6" component="h2">
          Select Lap
        </Typography>
        <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          {sessionData.laps.map((lap) => (
            <ListItem key={lap} disablePadding>
              <ListItemButton 
                onClick={() => {
                  onLapSelect(lap);
                  onClose();
                }}
                selected={lap === currentLap}
              >
                <ListItemText primary={`Lap ${lap}`} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Modal>
  );
};
