import { Modal, Box, Typography } from '@mui/material';
import { PaddockLap } from '../services/types';
import { Lap } from './Lap';

interface LapsModalProps {
  open: boolean;
  onClose: () => void;
  laps: PaddockLap[];
}

export function LapsModal({ open, onClose, laps }: LapsModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="laps-modal-title"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        maxHeight: '80vh',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        overflow: 'auto',
      }}>
        <Typography id="laps-modal-title" variant="h6" component="h2" gutterBottom>
          Available Laps
        </Typography>
        {laps.map((lap) => (
          <Lap key={lap.id} lap={lap} />
        ))}
      </Box>
    </Modal>
  );
}
