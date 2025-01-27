import { Box } from '@mui/material';
import { SpeedGraph, ThrottleGraph, BrakeGraph, HandbrakeGraph, GearGraph, LapTimeGraph, DeltaGraph } from '../LineGraph';
import { useAnalysisContext } from '../../contexts/AnalysisContext';
import { logger } from '../../utils/logger'

interface TelemetryGraphsProps {
  visibleAnnotations: (string | null)[];
}

export function TelemetryGraphs({ visibleAnnotations }: TelemetryGraphsProps) {
  const { analysisData, lapsData, zoomState, setZoomRange } = useAnalysisContext();
  // log the number of graphs
  logger.analysis('TelemetryGraphs', lapsData);
  if (Object.keys(lapsData).length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: '100%', overflow: 'auto', flex: 1 }}>
      <Box sx={{ minHeight: '50px' }}>
        <DeltaGraph
          lapsData={lapsData}
          zoomState={zoomState}
          onZoomChange={setZoomRange}
          showBrush={false}
          analysisData={analysisData}
          visibleAnnotations={visibleAnnotations}
          />
      </Box>
      <Box sx={{ minHeight: '50px' }}>
        <LapTimeGraph
          lapsData={lapsData}
          zoomState={zoomState}
          onZoomChange={setZoomRange}
          showBrush={false}
          analysisData={analysisData}
          visibleAnnotations={visibleAnnotations}
          />
      </Box>
      <Box sx={{ minHeight: '150px' }}>
        <SpeedGraph
          lapsData={lapsData}
          zoomState={zoomState}
          onZoomChange={setZoomRange}
          showBrush={false}
          analysisData={analysisData}
          visibleAnnotations={visibleAnnotations}
          />
      </Box>
      <Box sx={{ minHeight: '150px' }}>
        <ThrottleGraph
          lapsData={lapsData}
          zoomState={zoomState}
          onZoomChange={setZoomRange}
          showBrush={false}
          analysisData={analysisData}
          visibleAnnotations={visibleAnnotations}
        />
      </Box>
      <Box sx={{ minHeight: '150px' }}>
        <BrakeGraph
          lapsData={lapsData}
          zoomState={zoomState}
          onZoomChange={setZoomRange}
          showBrush={false}
          analysisData={analysisData}
          visibleAnnotations={visibleAnnotations}
        />
      </Box>
      <Box sx={{ minHeight: '150px' }}>
        <HandbrakeGraph
          lapsData={lapsData}
          zoomState={zoomState}
          onZoomChange={setZoomRange}
          showBrush={false}
          analysisData={analysisData}
          visibleAnnotations={visibleAnnotations}
        />
      </Box>
      <Box sx={{ minHeight: '150px' }}>
        <GearGraph
          lapsData={lapsData}
          zoomState={zoomState}
          onZoomChange={setZoomRange}
          showBrush={true}  // Only show brush on bottom graph
          analysisData={analysisData}
          visibleAnnotations={visibleAnnotations}
        />
      </Box>
    </Box>
  );
}
