import { Box, IconButton } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';
import { useState } from 'react';
import { LapsModal } from './LapsModal';
import { AnalysisData } from '../../services/types';

interface AnalysisToolbarProps {
  onLapSelect: (lap: number) => void;
  analysisData?: AnalysisData;
}

export function AnalysisToolbar({ onLapSelect, analysisData }: AnalysisToolbarProps) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
      <IconButton
        onClick={() => navigate('/sessions')}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
          color: 'white',
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      <ThemeToggle />
      <IconButton
        aria-label="modify laps"
        size="large"
        onClick={() => setIsModalOpen(true)}
      >
        <TimelineIcon />
      </IconButton>

      {analysisData && (
        <LapsModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          analysisData={analysisData}
          onLapSelect={onLapSelect}
        />
      )}
    </Box>
  );
}
