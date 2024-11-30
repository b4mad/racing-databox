import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAnalysisContext } from '../../contexts/AnalysisContext';
import { logger } from '../../utils/logger';

export function LapSelectionPanel() {
  const { analysisData, lapsData, lapIds, handleLapSelect } = useAnalysisContext();

  if (!analysisData?.laps) {
    return null;
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  // Get the fastest lap time to calculate deltas
  const fastestLapTime = Math.min(...analysisData.laps.map(lap => lap.time));
  const selectedLaps = lapIds?.filter((id): id is number => id !== null) ?? [];

  return (
    <Box sx={{ p: 1 }}>
      <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {analysisData.laps.map((lap, index) => {
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
              onClick={() => handleLapSelect(lap.id)}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                        {lap.valid ? (
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
                        ) : (
                          <CancelIcon sx={{ color: 'error.main', fontSize: 16 }} />
                        )}
                      </Box>
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
    </Box>
  );
}
