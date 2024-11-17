import { Modal, Box, Typography } from '@mui/material';
import { Lap } from './Lap';
import { SessionListItem } from './SessionListItem';
import { AnalysisData } from '../services/types';

interface LapsModalProps {
  open: boolean;
  onClose: () => void;
  analysisData: AnalysisData;
}

export function LapsModal({ open, onClose, analysisData }: LapsModalProps) {
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
          Session Details
        </Typography>
        <SessionListItem session={analysisData.session} />
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Available Laps</Typography>
        {analysisData.laps.map((lap) => (
          <Lap key={lap.id} lap={lap} />
        ))}
      </Box>
    </Modal>
  );
}
