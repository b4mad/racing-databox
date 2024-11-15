import { Box, Typography, Grid, IconButton } from '@mui/material';
import { formatTime } from '../utils/timeFormat';
import { PaddockLap } from '../services/types';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

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
          {lap.valid ? (
            <CheckCircleIcon sx={{ color: validityColor }} />
          ) : (
            <CancelIcon sx={{ color: validityColor }} />
          )}
        </Grid>

        {/* Lap Times */}
        <Grid item xs={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">Time / Official</Typography>
            <Typography variant="body1">
              {formatTime(lap.time)} / {formatTime(lap.officialTime)}
            </Typography>
          </Box>
        </Grid>

        {/* Length and Status */}
        <Grid item xs={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">Length / Status</Typography>
            <Typography variant="body1">
              {lap.length ? `${lap.length.toFixed(1)}m` : 'N/A'} / {lap.completed ? 'Completed' : 'Incomplete'}
            </Typography>
          </Box>
        </Grid>

        {/* Session Info */}
        <Grid item xs={3}>
          <Box>
            <Typography variant="body2" color="text.secondary">Session</Typography>
            <Typography variant="body1" noWrap>
              {lap.session ? `${lap.session.track.name || 'Unknown Track'} - ${lap.session.sessionType.type || 'Unknown Type'}` : 'N/A'}
            </Typography>
          </Box>
        </Grid>

        {/* View Action */}
        <Grid item xs={1}>
          <IconButton
            component={Link}
            to={`/session/${lap.session?.sessionId}?lap=${lap.id}`}
            color="primary"
            aria-label="view lap"
          >
            <VisibilityIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
}
