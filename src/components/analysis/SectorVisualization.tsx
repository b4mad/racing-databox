import { Box, Button, Stack } from '@mui/material';
import { TelemetryPoint, AnalysisData } from '../../services/types';

interface SectorVisualizationProps {
  currentLapData: TelemetryPoint[];
  setZoomRange: (startMeters: number, endMeters: number) => void;
  analysisData?: AnalysisData;
}

export function SectorVisualization({ currentLapData, setZoomRange, analysisData }: SectorVisualizationProps) {
  const zoomOut = () => {
    if (currentLapData.length === 0) return;
    const maxDistance = currentLapData[currentLapData.length - 1].distance;
    setZoomRange(0, maxDistance);
  };

  const zoomToFirstThird = () => {
    if (currentLapData.length === 0) return;
    const maxDistance = currentLapData[currentLapData.length - 1].distance;
    setZoomRange(0, maxDistance / 3);
  };

  const zoomToMiddleThird = () => {
    if (currentLapData.length === 0) return;
    const maxDistance = currentLapData[currentLapData.length - 1].distance;
    setZoomRange(maxDistance / 3, (maxDistance * 2) / 3);
  };

  const zoomToLastThird = () => {
    if (currentLapData.length === 0) return;
    const maxDistance = currentLapData[currentLapData.length - 1].distance;
    setZoomRange((maxDistance * 2) / 3, maxDistance);
  };

  return (
    <Box sx={{ p: 1 }}>
      <Stack spacing={1}>
        <Box sx={{ overflow: 'auto', maxWidth: '100%' }}>
          <Stack direction="row" spacing={1} sx={{ minWidth: 'min-content' }}>
          <Button size="small" variant="outlined" onClick={zoomOut} sx={{ whiteSpace: 'nowrap' }}>Full Track</Button>
          {(!analysisData?.landmarks?.segments?.length) && (
            <>
              <Button size="small" variant="outlined" onClick={zoomToFirstThird} sx={{ whiteSpace: 'nowrap' }}>First Third</Button>
              <Button size="small" variant="outlined" onClick={zoomToMiddleThird} sx={{ whiteSpace: 'nowrap' }}>Middle Third</Button>
              <Button size="small" variant="outlined" onClick={zoomToLastThird} sx={{ whiteSpace: 'nowrap' }}>Last Third</Button>
            </>
          )}
          {analysisData?.landmarks?.segments?.map((segment) => (
            <Button
              key={segment.id}
              size="small"
              variant="outlined" 
              sx={{ whiteSpace: 'nowrap' }}
              onClick={() => setZoomRange(segment.start, segment.end ?? segment.start + 100)}
            >
              {segment.name}
            </Button>
          ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
