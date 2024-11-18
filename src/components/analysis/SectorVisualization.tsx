import { Box, Button, Stack, Typography } from '@mui/material';
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
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={zoomOut}>Full Track</Button>
          <Button size="small" variant="outlined" onClick={zoomToFirstThird}>First Third</Button>
          <Button size="small" variant="outlined" onClick={zoomToMiddleThird}>Middle Third</Button>
          <Button size="small" variant="outlined" onClick={zoomToLastThird}>Last Third</Button>
        </Stack>

        {analysisData?.landmarks && (
          <>
            {analysisData.landmarks.segments.length > 0 && (
              <>
                <Typography variant="subtitle2">Segments</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {analysisData.landmarks.segments.map((segment) => (
                    <Button
                      key={segment.id}
                      size="small"
                      variant="outlined"
                      onClick={() => setZoomRange(segment.start, segment.end ?? segment.start + 100)}
                    >
                      {segment.name}
                    </Button>
                  ))}
                </Stack>
              </>
            )}

            {analysisData.landmarks.turns.length > 0 && (
              <>
                <Typography variant="subtitle2">Turns</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {analysisData.landmarks.turns.map((turn) => (
                    <Button
                      key={turn.id}
                      size="small"
                      variant="outlined"
                      onClick={() => setZoomRange(turn.start, turn.end ?? turn.start + 50)}
                    >
                      {turn.name}
                    </Button>
                  ))}
                </Stack>
              </>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
}
