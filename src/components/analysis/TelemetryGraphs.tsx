import { Box } from '@mui/material';
import { SpeedGraph, PedalsGraph, GearGraph } from '../LineGraph';
import { TelemetryCacheEntry } from '../../services/types';
import { ZoomState } from '../types';

interface TelemetryGraphsProps {
  lapsData: { [lapNumber: number]: TelemetryCacheEntry };
  zoomState: ZoomState;
  setZoomRange: (startMeters: number, endMeters: number) => void;
}

export function TelemetryGraphs({ lapsData, zoomState, setZoomRange }: TelemetryGraphsProps) {
  if (Object.keys(lapsData).length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      <Box sx={{ flex: 1 }}>
        <SpeedGraph
          lapsData={lapsData}
          zoomState={zoomState}
          onZoomChange={setZoomRange}
          showBrush={false}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <PedalsGraph
          lapsData={lapsData}
          zoomState={zoomState}
          onZoomChange={setZoomRange}
          showBrush={false}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <GearGraph
          lapsData={lapsData}
          zoomState={zoomState}
          onZoomChange={setZoomRange}
          showBrush={true}  // Only show brush on bottom graph
        />
      </Box>
    </Box>
  );
}
