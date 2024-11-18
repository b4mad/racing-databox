import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
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

  // Get the fastest lap time to calculate deltas
  const fastestLapTime = Math.min(...laps.map(lap => lap.time));

  return (
    <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {laps.map((lap, index) => {
        const deltaTime = lap.time - fastestLapTime;
        const deltaString = deltaTime === 0 ? '' : ` (${deltaTime > 0 ? '+' : ''}${deltaTime.toFixed(3)}s)`;
        
        return (
          <ListItem
            key={lap.id}
            sx={{
              borderLeft: '4px solid',
              borderLeftColor: selectedLaps.includes(lap.id) ? 'primary.main' : 'transparent',
              borderRadius: 1,
              mb: 0.5,
              bgcolor: selectedLaps.includes(lap.id) ? 'action.selected' : 'transparent',
              '&:hover': {
                bgcolor: 'action.hover',
              },
              cursor: 'pointer',
            }}
            onClick={() => onLapSelect(lap.id)}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="body2" 
                    component="span" 
                    sx={{ 
                      minWidth: '20px',
                      mr: 1,
                      color: 'text.secondary'
                    }}
                  >
                    {index + 1}
                  </Typography>
                  <Typography variant="body2" component="span">
                    {formatTime(lap.time)}
                    <Typography 
                      component="span" 
                      variant="body2" 
                      sx={{ color: 'text.secondary' }}
                    >
                      {deltaString}
                    </Typography>
                  </Typography>
                </Box>
              }
              secondary={
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {lap.driver?.name || 'Unknown Driver'}
                </Typography>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
}
