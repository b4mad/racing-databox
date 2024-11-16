import { useState } from 'react'
import { Button, Stack } from '@mui/material'
import { SelectGame } from './SelectGame'
import { SelectLap } from './SelectLap'
import { SelectSegment } from './SelectSegment'
import { SessionInformation, TrackLandmarks, TelemetryPoint } from '../services/types'

interface SessionControlsProps {
  paddockOpen: boolean
  setPaddockOpen: (open: boolean) => void
  navigationOpen: boolean
  setNavigationOpen: (open: boolean) => void
  sessionInformation?: SessionInformation
  onLapSelect: (lap: number) => void
  currentLap: number
  landmarks: TrackLandmarks | null | undefined
  currentLapData: TelemetryPoint[]
  setZoomRange: (startMeters: number, endMeters: number) => void
}

export function SessionControls({
  paddockOpen,
  setPaddockOpen,
  navigationOpen,
  setNavigationOpen,
  sessionInformation,
  onLapSelect,
  currentLap,
  landmarks,
  currentLapData,
  setZoomRange
}: SessionControlsProps) {
  const [landmarksOpen, setLandmarksOpen] = useState(false);


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
    <Stack direction="row" spacing={2}>
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={zoomOut}>Full Track</Button>
        <Button size="small" variant="outlined" onClick={zoomToFirstThird}>First Third</Button>
        <Button size="small" variant="outlined" onClick={zoomToMiddleThird}>Middle Third</Button>
        <Button size="small" variant="outlined" onClick={zoomToLastThird}>Last Third</Button>
      </Stack>
      {/* <Button variant="contained" onClick={() => setPaddockOpen(true)}>
        Select Game
      </Button> */}
      <Button variant="contained" onClick={() => setNavigationOpen(true)}>
        Select Lap
      </Button>
      <Button
        variant="contained"
        onClick={() => setLandmarksOpen(true)}
        disabled={!landmarks}
      >
        Select Segment
      </Button>

      <SelectSegment
        open={landmarksOpen}
        onClose={() => setLandmarksOpen(false)}
        landmarks={landmarks}
        setZoomRange={setZoomRange}
      />

      <SelectGame
        open={paddockOpen}
        onClose={() => setPaddockOpen(false)}
        onGameSelect={(game) => {
          console.log('Selected game:', game);
          // TODO: Implement game selection logic
        }}
      />

      {/* <SelectLap
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        sessionInformation={sessionInformation}
        onLapSelect={onLapSelect}
        currentLap={currentLap ?? 0}
      /> */}
    </Stack>
  )
}
