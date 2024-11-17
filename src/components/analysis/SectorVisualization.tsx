import { Box, Button, Stack } from '@mui/material';
import { TelemetryPoint } from '../../services/types';

interface SectorVisualizationProps {
  currentLapData: TelemetryPoint[];
  setZoomRange: (startMeters: number, endMeters: number) => void;
}

export function SectorVisualization({ currentLapData, setZoomRange }: SectorVisualizationProps) {
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
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={zoomOut}>Full Track</Button>
        <Button size="small" variant="outlined" onClick={zoomToFirstThird}>First Third</Button>
        <Button size="small" variant="outlined" onClick={zoomToMiddleThird}>Middle Third</Button>
        <Button size="small" variant="outlined" onClick={zoomToLastThird}>Last Third</Button>
      </Stack>
    </Box>
  );
}
