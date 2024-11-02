import { Box, Stack } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { MapLine } from './MapLine'
import { SpeedGraph, PedalsGraph, GearGraph } from './LineGraph'
import { TelemetryPoint } from '../services/types'

interface TelemetryVisualizationProps {
  currentLapData: TelemetryPoint[]
  mapDataAvailable: boolean
}

export function TelemetryVisualization({ currentLapData, mapDataAvailable }: TelemetryVisualizationProps) {
  return (
    <Grid container spacing={2} sx={{ height: "100%" }}>
      {mapDataAvailable && (
        <Grid size={6}>
          <Box sx={{ height: "50%" }}>
            <MapLine data={currentLapData} />
          </Box>
        </Grid>
      )}
      <Grid size={mapDataAvailable ? 6 : 12}>
        <Stack>
          {currentLapData.length > 0 && (
            <>
              <Box sx={{ height: "200px" }}>
                <SpeedGraph currentLapData={currentLapData} syncId="telemetry" />
              </Box>
              <Box sx={{ height: "200px" }}>
                <PedalsGraph currentLapData={currentLapData} syncId="telemetry" />
              </Box>
              <Box sx={{ height: "200px" }}>
                <GearGraph currentLapData={currentLapData} syncId="telemetry" showBrush={true} />
              </Box>
            </>
          )}
        </Stack>
      </Grid>
    </Grid>
  )
}
