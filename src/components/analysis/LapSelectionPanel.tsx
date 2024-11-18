import { Box } from '@mui/material';
import { AnalysisData, TelemetryCacheEntry } from '../../services/types';
import { LapSelectionList } from './LapSelectionList';
import { useSearchParams } from 'react-router-dom';

interface LapSelectionPanelProps {
  analysisData?: AnalysisData;
  lapsData: { [lapId: number]: TelemetryCacheEntry };
}

export function LapSelectionPanel({ analysisData, lapsData }: LapSelectionPanelProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLaps = searchParams.get('laps')?.split(',').map(Number) || [];

  const handleLapSelect = (lapId: number) => {
    const newSelectedLaps = selectedLaps.includes(lapId)
      ? selectedLaps.filter(id => id !== lapId)
      : [...selectedLaps, lapId];

    const params = new URLSearchParams(searchParams);
    params.set('laps', newSelectedLaps.join(','));
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
        lapsData={lapsData}
      />
    </Box>
  );
}
