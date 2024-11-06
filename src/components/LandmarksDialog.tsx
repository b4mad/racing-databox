import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Typography } from '@mui/material';
import { TrackLandmarks } from '../services/types';

interface LandmarksDialogProps {
  open: boolean;
  onClose: () => void;
  landmarks: TrackLandmarks | null;
}

export function LandmarksDialog({ open, onClose, landmarks }: LandmarksDialogProps) {
  if (!landmarks) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Track Landmarks</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Segments</Typography>
        <List>
          {landmarks.segments.map((segment) => (
            <ListItem key={segment.id}>
              <ListItemText
                primary={segment.name}
                secondary={`Start: ${segment.start}m${segment.end ? `, End: ${segment.end}m` : ''}`}
              />
            </ListItem>
          ))}
        </List>
        <Typography variant="h6" gutterBottom>Turns</Typography>
        <List>
          {landmarks.turns.map((turn) => (
            <ListItem key={turn.id}>
              <ListItemText
                primary={turn.name}
                secondary={`Start: ${turn.start}m${turn.end ? `, End: ${turn.end}m` : ''}`}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
