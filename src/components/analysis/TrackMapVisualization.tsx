import { Box } from '@mui/material';
import { MapLine } from '../MapLine';
import { useAnalysisContext } from '../../contexts/AnalysisContext';

interface TrackMapVisualizationProps {
  showTurns: boolean;
  showSegments: boolean;
}

export function TrackMapVisualization({ showTurns, showSegments }: TrackMapVisualizationProps) {
  const { analysisData, lapsData, zoomState, setZoomRange } = useAnalysisContext();
  const firstLapNumber = Object.keys(lapsData)[0];
  const mapDataAvailable = firstLapNumber ? lapsData[parseInt(firstLapNumber)].mapDataAvailable : false;

  if (!mapDataAvailable) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <MapLine
        lapsData={lapsData}
        zoomState={zoomState}
        onZoomChange={setZoomRange}
        analysisData={analysisData}
        showTurns={showTurns}
        showSegments={showSegments}
      />
    </Box>
  );
}
