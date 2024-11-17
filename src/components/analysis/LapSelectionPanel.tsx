import { Box, Typography, List, ListItem, ListItemButton, ListItemText, Checkbox } from '@mui/material';
import { useQueryParam, DelimitedNumericArrayParam } from 'use-query-params';
import { AnalysisData } from '../../services/types';

interface LapSelectionPanelProps {
  analysisData?: AnalysisData;
}

export function LapSelectionPanel({ analysisData }: LapSelectionPanelProps) {
  const [selectedLaps, setSelectedLaps] = useQueryParam('laps', DelimitedNumericArrayParam);

  if (!analysisData) {
    return null;
  }

  const handleLapToggle = (lapId: number) => {
    const currentSelected = selectedLaps || [];
    const newSelected = currentSelected.includes(lapId)
      ? currentSelected.filter(id => id !== lapId)
      : [...currentSelected, lapId];

    // Ensure at least one lap remains selected
    if (newSelected.length > 0) {
      setSelectedLaps(newSelected);
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h6" gutterBottom>
        Laps:
      </Typography>
      <List dense>
        {analysisData.laps.map((lap) => {
          const labelId = `lap-${lap.id}`;
          const isSelected = selectedLaps?.includes(lap.id) || false;
          const lapTimeStr = lap.time
            ? `${(lap.time / 1000).toFixed(3)}s`
            : 'No time';

          return (
            <ListItem
              key={lap.id}
              disablePadding
              secondaryAction={
                <Checkbox
                  edge="end"
                  checked={isSelected}
                  onChange={() => handleLapToggle(lap.id)}
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              }
            >
              <ListItemButton onClick={() => handleLapToggle(lap.id)} dense>
                <ListItemText
                  id={labelId}
                  primary={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography component="span">{lap.number}</Typography>
                      <Typography component="span">
                        {lapTimeStr}
                      </Typography>
                    </Box>
                  }
                  secondary={lap.session?.driver?.name || 'Unknown Driver'}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
