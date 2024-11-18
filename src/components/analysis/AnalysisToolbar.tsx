import { Box, IconButton, Typography, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';
import { AnalysisData } from '../../services/types';

interface AnalysisToolbarProps {
  analysisData?: AnalysisData;
}

export function AnalysisToolbar({ analysisData }: AnalysisToolbarProps) {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
      </Box>

      {analysisData && (
        <Stack direction="row" spacing={2} sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          pr: 2,
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: 1,
          px: 2,
          py: 0.5
        }}>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            {analysisData.track.name || 'Unknown Track'}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            {analysisData.car.name || 'Unknown Car'}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            {analysisData.driver.name || 'Unknown Driver'}
          </Typography>
        </Stack>
      )}
      <ThemeToggle />
    </Box>
  );
}
