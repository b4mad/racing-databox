import { Box } from '@mui/material';
import { MapLine } from '../MapLine';
import { TelemetryCacheEntry } from '../../services/types';
import { ZoomState } from '../types';

interface TrackMapVisualizationProps {
  lapsData: { [lapNumber: number]: TelemetryCacheEntry };
  zoomState: ZoomState;
}

export function TrackMapVisualization({ lapsData, zoomState }: TrackMapVisualizationProps) {
  const firstLapNumber = Object.keys(lapsData)[0];
  const mapDataAvailable = firstLapNumber ? lapsData[parseInt(firstLapNumber)].mapDataAvailable : false;

  if (!mapDataAvailable) {
    return null;
  }

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <MapLine lapsData={lapsData} zoomState={zoomState} />
    </Box>
  );
}