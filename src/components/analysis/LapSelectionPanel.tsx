import { Box } from '@mui/material';
import { LapSelectionList } from './LapSelectionList';
import { useAnalysisContext } from '../../contexts/AnalysisContext';

export function LapSelectionPanel() {
  const { analysisData, lapsData, lapIds, handleLapSelect } = useAnalysisContext();

  if (!analysisData?.laps) {
    return null;
  }

  return (
    <Box sx={{ p: 1 }}>
      <LapSelectionList
        laps={analysisData.laps}
        selectedLaps={lapIds?.filter((id): id is number => id !== null) ?? []}
        onLapSelect={handleLapSelect}
        lapsData={lapsData}
      />
    </Box>
  );
}
