import { Box, Stack } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { MapLine } from './MapLine'
import { SpeedGraph, PedalsGraph, GearGraph } from './LineGraph'
import { SessionInfoBox } from './SessionInfoBox'
import { TelemetryCacheEntry, AnalysisData } from '../services/types'
import { ZoomState } from './types'

interface TelemetryVisualizationProps {
  analysisData: AnalysisData | undefined
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
  const firstLapId = analysisData?.laps[0]?.id;
  const currentLapData = firstLapId ? lapsData[firstLapId]?.points ?? [] : [];
  const firstLapNumber = Object.keys(lapsData)[0];
  const mapDataAvailable = firstLapNumber ? lapsData[parseInt(firstLapNumber)].mapDataAvailable : false;
  return (
    <Grid container spacing={2} sx={{ height: "100%" }}>
      {mapDataAvailable && (
        <Grid size={6}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            <Box sx={{ height: "50%" }}>
              <MapLine data={currentLapData} zoomState={zoomState} />
            </Box>
            {analysisData && (
              <Box sx={{ height: "auto" }}>
                <SessionInfoBox analysisData={analysisData} />
              </Box>
            )}
          </Stack>
        </Grid>
      )}
      <Grid size={mapDataAvailable ? 6 : 12}>
        <Stack>
          {currentLapData.length > 0 && (
            <>
              <Box sx={{ height: "200px" }}>
                <SpeedGraph currentLapData={currentLapData} zoomState={zoomState} onZoomChange={setZoomRange} />
              </Box>
              <Box sx={{ height: "200px" }}>
                <PedalsGraph currentLapData={currentLapData} zoomState={zoomState} onZoomChange={setZoomRange} />
              </Box>
              <Box sx={{ height: "200px" }}>
                <GearGraph currentLapData={currentLapData} showBrush={true} zoomState={zoomState} onZoomChange={setZoomRange} />
              </Box>
            </>
          )}
        </Stack>
      </Grid>
    </Grid>
  )
}
