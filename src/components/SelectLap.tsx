import { Modal, Box, Typography, List } from '@mui/material';
import { SessionInformation, PaddockLap } from '../services/types';
import { Lap } from './Lap';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 1200,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface SelectLapProps {
  open: boolean;
  onClose: () => void;
  sessionInformation: SessionInformation | null | undefined;
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
          {sessionInformation.lapDetails.map((lap: PaddockLap) => (
            <Box
              key={lap.id}
              onClick={() => {
                onLapSelect(lap.id);
                onClose();
              }}
              sx={{ cursor: 'pointer' }}
            >
              <Lap lap={lap} selected={lap.id === currentLap} />
            </Box>
          ))}
        </List>
      </Box>
    </Modal>
  );
};
