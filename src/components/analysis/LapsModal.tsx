import { Modal, Box, Typography, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { Lap } from '../Lap';
import { SessionListItem } from '../SessionListItem';
import { AnalysisData, PaddockLap } from '../../services/types';
import { useSession } from '../../hooks/useSession';

interface LapsModalProps {
  open: boolean;
  onClose: () => void;
  analysisData: AnalysisData;
  onLapSelect: (lapId: number) => void;
}

export function LapsModal({ open, onClose, analysisData, onLapSelect }: LapsModalProps) {
  const { fetchLaps } = useSession();
  const [additionalLaps, setAdditionalLaps] = useState<PaddockLap[]>([]);
  const [loading, setLoading] = useState(false);
  const { handleError } = useErrorHandler('analysis');

  useEffect(() => {
    async function loadAdditionalLaps() {
      if (!open) return;

      try {
        setLoading(true);
        const laps = await fetchLaps(analysisData.track.id, analysisData.car.id);
        // Filter out laps that are already in the session
        const sessionLapIds = new Set(analysisData.laps.map(lap => lap.id));
        const filteredLaps = laps.filter(lap => !sessionLapIds.has(lap.id));
        setAdditionalLaps(filteredLaps);
      } catch (err) {
        handleError(err, 'Failed to load additional laps');
      } finally {
        setLoading(false);
      }
    }

    loadAdditionalLaps();
  }, [open, analysisData.track.id, analysisData.car.id, fetchLaps]);

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
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Session Laps</Typography>
        {analysisData.laps.map((lap) => (
          <Lap key={lap.id} lap={lap} onLapSelect={onLapSelect} />
        ))}

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Other Laps with Same Car/Track</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : additionalLaps.length === 0 ? (
          <Typography color="text.secondary">No additional laps found</Typography>
        ) : (
          additionalLaps.map((lap) => (
            <Lap key={lap.id} lap={lap} onLapSelect={onLapSelect} />
          ))
        )}
        <Typography id="laps-modal-title" variant="h6" component="h2" gutterBottom>
          Session Details
        </Typography>
        <SessionListItem
          session={analysisData.session}
          onLapSelect={onLapSelect}
          defaultExpanded={true}
        />
      </Box>
    </Modal>
  );
}
