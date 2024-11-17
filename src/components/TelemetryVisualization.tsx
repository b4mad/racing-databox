import { Box, Stack } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { MapLine } from './MapLine'
import { SpeedGraph, PedalsGraph, GearGraph } from './LineGraph'
import { SessionInfoBox } from './SessionInfoBox'
import { TelemetryCacheEntry, AnalysisData } from '../services/types'
import { ZoomState } from './types'

interface TelemetryVisualizationProps {
  analysisData: AnalysisData
  zoomState: ZoomState
  setZoomRange: (startMeters: number, endMeters: number) => void
  lapsData: { [lapNumber: number]: TelemetryCacheEntry }
}

export function TelemetryVisualization({
  analysisData,
  zoomState,
  setZoomRange,
  lapsData
}: TelemetryVisualizationProps) {
  const firstLapNumber = Object.keys(lapsData)[0];
  const mapDataAvailable = firstLapNumber ? lapsData[parseInt(firstLapNumber)].mapDataAvailable : false;
  return (
    <Grid container spacing={2} sx={{ height: "100%" }}>
      <Grid size={6}>
        <Stack spacing={2} sx={{ height: "100%" }}>
          {mapDataAvailable && (
            <Box sx={{ height: "50%" }}>
              <MapLine lapsData={lapsData} zoomState={zoomState} />
            </Box>
          )}
          <Box sx={{ height: "auto" }}>
            <SessionInfoBox analysisData={analysisData} />
          </Box>
        </Stack>
      </Grid>
      <Grid size={6}>
        <Stack>
          {Object.keys(lapsData).length > 0 && (
            <>
              <Box sx={{ height: "200px" }}>
                <SpeedGraph lapsData={lapsData} zoomState={zoomState} onZoomChange={setZoomRange} />
              </Box>
              <Box sx={{ height: "200px" }}>
                <PedalsGraph lapsData={lapsData} zoomState={zoomState} onZoomChange={setZoomRange} />
              </Box>
              <Box sx={{ height: "200px" }}>
                <GearGraph lapsData={lapsData} showBrush={true} zoomState={zoomState} onZoomChange={setZoomRange} />
              </Box>
            </>
          )}
        </Stack>
      </Grid>
    </Grid>
  )
}
