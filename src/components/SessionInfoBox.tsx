import { Box, Typography, Paper } from '@mui/material';
import { PaddockSession } from '../services/types';

interface SessionInfoBoxProps {
  session: PaddockSession;
}

export function SessionInfoBox({ session }: SessionInfoBoxProps) {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Session Information
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1 }}>
        <Typography variant="subtitle2">Car:</Typography>
        <Typography>{session.car.name}</Typography>

        <Typography variant="subtitle2">Driver:</Typography>
        <Typography>{session.driver.name}</Typography>

        <Typography variant="subtitle2">Game:</Typography>
        <Typography>{session.game.name}</Typography>

        <Typography variant="subtitle2">Track:</Typography>
        <Typography>{session.track.name}</Typography>

        <Typography variant="subtitle2">Session Type:</Typography>
        <Typography>{session.sessionType.type}</Typography>
      </Box>
    </Paper>
  );
}
