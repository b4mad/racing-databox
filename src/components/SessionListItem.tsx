import { Box, Paper, Typography, IconButton, Collapse } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useState } from 'react';
import { PaddockSession } from '../services/types';
import { useNavigate } from 'react-router-dom';

interface SessionListItemProps {
  session: PaddockSession;
}

export function SessionListItem({ session }: SessionListItemProps) {
  const [expanded, setExpanded] = useState(false);
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
          <Typography variant="h6">{session.car.name}</Typography>
          <Typography>{session.track.name}</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Box>
            <Typography>Events: {session.laps.length}</Typography>
            <Typography>Laps: {session.laps.length}</Typography>
          </Box>

          <Box>
            <Typography>Last driven: {/* TODO: Format timestamp */}</Typography>
            <Typography>Total time: {/* TODO: Format duration */}</Typography>
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
          {/* TODO: Add event details table */}
        </Box>
      </Collapse>
    </Paper>
  );
}
