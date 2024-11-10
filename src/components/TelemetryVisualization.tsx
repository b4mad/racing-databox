import { Box, Stack } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { MapLine } from './MapLine'
import { SpeedGraph, PedalsGraph, GearGraph } from './LineGraph'
import { SessionInfoBox } from './SessionInfoBox'
import { TelemetryPoint, PaddockSession } from '../services/types'
import { ZoomState } from './types'

interface TelemetryVisualizationProps {
  currentLapData: TelemetryPoint[]
  compareLapData?: TelemetryPoint[]
  session: PaddockSession | null
  zoomState: ZoomState
  setZoomRange: (startMeters: number, endMeters: number) => void
}

export function TelemetryVisualization({
  currentLapData,
  mapDataAvailable,
  session = null,
  zoomState,
  setZoomRange
}: TelemetryVisualizationProps) {
  return (
    <Grid container spacing={2} sx={{ height: "100%" }}>
      {mapDataAvailable && (
        <Grid size={6}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            <Box sx={{ height: "50%" }}>
              <MapLine data={currentLapData} syncId="telemetry" zoomState={zoomState} />
            </Box>
            {session && (
              <Box sx={{ height: "auto" }}>
                <SessionInfoBox session={session} />
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
                <SpeedGraph currentLapData={currentLapData} syncId="telemetry" zoomState={zoomState} onZoomChange={setZoomRange} />
              </Box>
              <Box sx={{ height: "200px" }}>
                <PedalsGraph currentLapData={currentLapData} syncId="telemetry" zoomState={zoomState} onZoomChange={setZoomRange} />
              </Box>
              <Box sx={{ height: "200px" }}>
                <GearGraph currentLapData={currentLapData} syncId="telemetry" showBrush={true} zoomState={zoomState} onZoomChange={setZoomRange} />
              </Box>
            </>
          )}
        </Stack>
      </Grid>
    </Grid>
  )
}
