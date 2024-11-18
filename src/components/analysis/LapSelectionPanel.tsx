import { Box } from '@mui/material';
import { AnalysisData } from '../../services/types';
import { LapSelectionList } from './LapSelectionList';
import { useSearchParams } from 'react-router-dom';

interface LapSelectionPanelProps {
  analysisData?: AnalysisData;
}

export function LapSelectionPanel({ analysisData }: LapSelectionPanelProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLaps = searchParams.getAll('lap').map(Number);

  const handleLapSelect = (lapId: number) => {
    const newSelectedLaps = selectedLaps.includes(lapId)
      ? selectedLaps.filter(id => id !== lapId)
      : [...selectedLaps, lapId];

    const params = new URLSearchParams(searchParams);
    params.delete('lap');
    newSelectedLaps.forEach(id => params.append('lap', id.toString()));
    setSearchParams(params);
  };

  if (!analysisData?.laps) {
    return null;
  }

  return (
    <Box sx={{ p: 1 }}>
      <LapSelectionList
        laps={analysisData.laps}
        selectedLaps={selectedLaps}
        onLapSelect={handleLapSelect}
      />
    </Box>
  );
}
