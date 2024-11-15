import { Box, Typography, Grid } from '@mui/material';
import { PaddockLap } from '../services/types';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';

interface LapProps {
  lap: PaddockLap;
  selected?: boolean;
}

export function Lap({ lap, selected = false }: LapProps) {
  const validityColor = lap.valid ? '#4CAF50' : '#FF9800';

  return (
    <Box
      sx={{
        display: 'flex',
        py: 1.5,
        px: 2,
        bgcolor: selected ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Lap Number */}
        <Grid item xs={1}>
          <Typography variant="h6">{lap.number}</Typography>
        </Grid>

        {/* Validity Indicator */}
        <Grid item xs={1}>
          <Box
            sx={{
              width: 24,
              height: 24,
              border: `2px solid ${validityColor}`,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            [&nbsp;]
          </Box>
        </Grid>

        {/* Lap Time */}
        <Grid item xs={2}>
          <Typography variant="h6">
            {lap.time.toFixed(3)}s
          </Typography>
        </Grid>

        {/* Temperature */}
        <Grid item xs={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">air temp</Typography>
            <Typography>{lap.telemetry?.[0]?.airTemp?.toFixed(2) || '--'} °C</Typography>
          </Box>
        </Grid>

        <Grid item xs={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">track temp</Typography>
            <Typography>{lap.telemetry?.[0]?.trackTemp?.toFixed(2) || '--'} °C</Typography>
          </Box>
        </Grid>

        {/* Fuel */}
        <Grid item xs={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">consumed</Typography>
            <Typography>{lap.telemetry?.[0]?.fuelConsumed?.toFixed(2) || '--'} l</Typography>
          </Box>
        </Grid>

        {/* Actions */}
        <Grid item xs={2}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <CompareArrowsIcon />
            <ChatBubbleOutlineIcon />
            <SettingsIcon />
            <GpsFixedIcon />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
