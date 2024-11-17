import { Box, Paper, Typography, IconButton, Collapse } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useState } from 'react';
import { Lap } from './Lap';
import { PaddockSession } from '../services/types';
import { useNavigate } from 'react-router-dom';

interface SessionListItemProps {
  session: PaddockSession;
  onLapSelect?: (lapId: number) => void;
  defaultExpanded?: boolean;
}

export function SessionListItem({ session, onLapSelect, defaultExpanded = false }: SessionListItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const navigate = useNavigate();

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleClick = () => {
    navigate(`/session/${session.sessionId}`);
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 1,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' }
      }}
      onClick={handleClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6">{session.car.name || `Car #${session.car.id}`}</Typography>
          <Typography>{session.track.name || `Track #${session.track.id}`}</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Box>
            <Typography>Events: {session.laps.length}</Typography>
            <Typography>Laps: {session.laps.length}</Typography>
          </Box>

          <Box>
            <Typography>Last driven: {/* TODO: Format timestamp */}</Typography>
            <Typography>Total time: {/* TODO: Format duration */}</Typography>
            {process.env.NODE_ENV === 'development' && (
              <Typography variant="caption" color="text.secondary">
                ID: {session.id}
              </Typography>
            )}
          </Box>

          <IconButton
            onClick={handleExpandClick}
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          {session.laps.map((lap) => (
            <Lap
              key={lap.id}
              lap={lap}
              onLapSelect={onLapSelect}
            />
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
}
