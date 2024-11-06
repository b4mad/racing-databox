import { Modal, Box, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(3);
  return `${minutes}:${remainingSeconds.padStart(6, '0')}`;
};
import { SessionInformation } from '../services/types';

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

interface SelectLapProps {
  open: boolean;
  onClose: () => void;
  sessionInformation: SessionInformation | null;
  onLapSelect: (lap: number) => void;
  currentLap: number;
}

export const SelectLap = ({ 
  open, 
  onClose, 
  sessionInformation, 
  onLapSelect,
  currentLap 
}: SelectLapProps) => {
  if (!sessionInformation) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="select-lap-modal"
    >
      <Box sx={style}>
        <Typography id="select-lap-modal" variant="h6" component="h2">
          Select Lap
        </Typography>
        <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          {sessionInformation.laps.map((lap) => (
            <ListItem key={lap} disablePadding>
              <ListItemButton 
                onClick={() => {
                  onLapSelect(lap);
                  onClose();
                }}
                selected={lap === currentLap}
              >
                <ListItemText 
                  primary={`Lap ${lap}`}
                  secondary={(() => {
                    const lapDetail = sessionInformation.lapDetails.find(detail => detail.number === lap);
                    if (!lapDetail) return 'No data';
                    return `${formatTime(lapDetail.time)} ${lapDetail.valid ? '✓' : '✗'}`;
                  })()}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Modal>
  );
};
