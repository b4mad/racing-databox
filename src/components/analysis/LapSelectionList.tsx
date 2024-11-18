import { Box, List, ListItem, ListItemText, Typography, IconButton, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TimerIcon from '@mui/icons-material/Timer';
import StraightIcon from '@mui/icons-material/Straight';
import { PaddockLap } from '../../services/types';

interface LapSelectionListProps {
  laps: PaddockLap[];
  selectedLaps: number[];
  onLapSelect: (lapId: number) => void;
}

export function LapSelectionList({ laps, selectedLaps, onLapSelect }: LapSelectionListProps) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  return (
    <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {laps.map((lap) => (
        <ListItem
          key={lap.id}
          sx={{
            borderRadius: 1,
            mb: 0.5,
            bgcolor: selectedLaps.includes(lap.id) ? 'action.selected' : 'transparent',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
          secondaryAction={
            <IconButton
              edge="end"
              onClick={() => onLapSelect(lap.id)}
              size="small"
              color={selectedLaps.includes(lap.id) ? 'primary' : 'default'}
            >
              {lap.valid ? (
                <Tooltip title="Valid Lap">
                  <CheckCircleIcon color="success" />
                </Tooltip>
              ) : (
                <Tooltip title="Invalid Lap">
                  <CancelIcon color="error" />
                </Tooltip>
              )}
            </IconButton>
          }
        >
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" component="span">
                  Lap {lap.number}
                </Typography>
              </Box>
            }
            secondary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TimerIcon fontSize="small" />
                  <Typography variant="body2" component="span">
                    {formatTime(lap.time)}
                  </Typography>
                </Box>
                {lap.length && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StraightIcon fontSize="small" />
                    <Typography variant="body2" component="span">
                      {Math.round(lap.length)}m
                    </Typography>
                  </Box>
                )}
              </Box>
            }
            onClick={() => onLapSelect(lap.id)}
            sx={{ cursor: 'pointer' }}
          />
        </ListItem>
      ))}
    </List>
  );
}
