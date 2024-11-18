import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import { PaddockLap, TelemetryCacheEntry } from '../../services/types';
import { logger } from '../../utils/logger';

interface LapSelectionListProps {
  laps: PaddockLap[];
  selectedLaps: number[];
  onLapSelect: (lapId: number) => void;
  lapsData: { [lapId: number]: TelemetryCacheEntry };
}

export function LapSelectionList({ laps, selectedLaps, onLapSelect, lapsData }: LapSelectionListProps) {
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
        logger.analysis('LapSelectionList', lapsData[lap.id]?.color);
        const deltaTime = lap.time - fastestLapTime;
        const deltaString = deltaTime === 0 ? '' : ` (${deltaTime > 0 ? '+' : ''}${deltaTime.toFixed(3)}s)`;

        const isSelected = true || selectedLaps.includes(lap.id);
        return (
          <ListItem
            key={lap.id}
            sx={{
              borderLeft: '4px solid',
              borderLeftColor: isSelected
                ? (lapsData[lap.id]?.color || 'primary.main')
                : 'transparent',
              borderRadius: 1,
              mb: 0.5,
              bgcolor: isSelected ? 'action.selected' : 'transparent',
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{
                        minWidth: '20px',
                        color: 'text.secondary'
                      }}
                    >
                      {index + 1}
                    </Typography>
                  </Box>
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
                  {lap.session?.driver?.name || 'Unknown Driver'}
                </Typography>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
}
