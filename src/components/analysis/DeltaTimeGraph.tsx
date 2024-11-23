import { Box } from '@mui/material';
import { DeltaGraph } from '../LineGraph';
import { useAnalysisContext } from '../../contexts/AnalysisContext';

export function DeltaTimeGraph() {
  const { lapsData, zoomState, setZoomRange } = useAnalysisContext();

  if (Object.keys(lapsData).length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <DeltaGraph
        lapsData={lapsData}
        zoomState={zoomState}
        onZoomChange={setZoomRange}
      />
    </Box>
  );
}
