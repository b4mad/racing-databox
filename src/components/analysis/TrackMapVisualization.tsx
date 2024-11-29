import { Box } from '@mui/material';
import { MapLine } from '../MapLine';
import { useAnalysisContext } from '../../contexts/AnalysisContext';

interface TrackMapVisualizationProps {
  visibleAnnotations: (string | null)[];
}

export function TrackMapVisualization({ visibleAnnotations }: TrackMapVisualizationProps) {
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
        visibleAnnotations={visibleAnnotations}
      />
    </Box>
  );
}
