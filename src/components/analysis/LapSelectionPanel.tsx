import { Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { AnalysisData, TelemetryCacheEntry } from '../../services/types';
import { LapSelectionList } from './LapSelectionList';
import { useSearchParams } from 'react-router-dom';

interface LapSelectionPanelProps {
  analysisData?: AnalysisData;
  lapsData: { [lapId: number]: TelemetryCacheEntry };
}

export function LapSelectionPanel({ analysisData, lapsData }: LapSelectionPanelProps) {
  const [searchParams] = useSearchParams();
  const [selectedLaps, setSelectedLaps] = useState<number[]>([]);

  // Initialize selected laps from URL or all laps
  useEffect(() => {
    const initialLaps = searchParams.get('laps')?.split(',').map(Number) ||
      (analysisData?.laps ? analysisData.laps.map(lap => lap.id) : []);
    setSelectedLaps(initialLaps);
  }, [searchParams, analysisData]);

  const handleLapSelect = (lapId: number) => {
    // Always keep all laps selected
    return;
    if (!selectedLaps.includes(lapId)) {
      setSelectedLaps([...selectedLaps, lapId]);
    }
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
