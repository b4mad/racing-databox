import { Box, IconButton } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';

interface AnalysisNavigationProps {
  onLapSelect: (lap: number) => void;
}

export function AnalysisNavigation({ onLapSelect }: AnalysisNavigationProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
      <IconButton
        aria-label="modify laps"
        size="large"
      >
        <TimelineIcon />
      </IconButton>
    </Box>
  );
}
