import { Box, Typography, Paper } from '@mui/material';
import { AnalysisData } from '../services/types';

interface SessionInfoBoxProps {
  analysisData: AnalysisData;
}

export function SessionInfoBox({ analysisData }: SessionInfoBoxProps) {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Session Information
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1 }}>
        <Typography variant="subtitle2">Car:</Typography>
        <Typography>{analysisData.car.name}</Typography>

        <Typography variant="subtitle2">Driver:</Typography>
        <Typography>{analysisData.session.driver.name}</Typography>

        <Typography variant="subtitle2">Game:</Typography>
        <Typography>{analysisData.game.name}</Typography>

        <Typography variant="subtitle2">Track:</Typography>
        <Typography>{analysisData.track.name}</Typography>

        <Typography variant="subtitle2">Session Type:</Typography>
        <Typography>{analysisData.session.sessionType.type}</Typography>
      </Box>
    </Paper>
  );
}
