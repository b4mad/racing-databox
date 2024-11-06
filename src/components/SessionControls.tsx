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
  sessionInformation: SessionInformation | null
  onLapSelect: (lap: number) => void
  currentLap: number
  landmarks: TrackLandmarks | null
  zoomState: {
    left: number;
    right: number;
    top: string | number;
    bottom: string | number;
  }
  setZoomState: (state: any) => void
  currentLapData: TelemetryPoint[]
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
  zoomState,
  setZoomState,
  currentLapData
}: SessionControlsProps) {
  const [landmarksOpen, setLandmarksOpen] = useState(false);

  const zoomOut = () => {
    if (currentLapData.length === 0) return;
    setZoomState({
      ...zoomState,
      left: 0,
      right: currentLapData[currentLapData.length - 1].distance
    });
  };

  const zoomToFirstThird = () => {
    if (currentLapData.length === 0) return;
    const maxDistance = currentLapData[currentLapData.length - 1].distance;
    setZoomState({
      ...zoomState,
      left: 0,
      right: maxDistance / 3
    });
  };

  const zoomToMiddleThird = () => {
    if (currentLapData.length === 0) return;
    const maxDistance = currentLapData[currentLapData.length - 1].distance;
    setZoomState({
      ...zoomState,
      left: maxDistance / 3,
      right: (maxDistance * 2) / 3
    });
  };

  const zoomToLastThird = () => {
    if (currentLapData.length === 0) return;
    const maxDistance = currentLapData[currentLapData.length - 1].distance;
    setZoomState({
      ...zoomState,
      left: (maxDistance * 2) / 3,
      right: maxDistance
    });
  };

  return (
    <Stack direction="row" spacing={2}>
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={zoomOut}>Full Track</Button>
        <Button size="small" variant="outlined" onClick={zoomToFirstThird}>First Third</Button>
        <Button size="small" variant="outlined" onClick={zoomToMiddleThird}>Middle Third</Button>
        <Button size="small" variant="outlined" onClick={zoomToLastThird}>Last Third</Button>
      </Stack>
      <Button variant="contained" onClick={() => setPaddockOpen(true)}>
        Select Game
      </Button>
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
        onSegmentSelect={(segmentId) => {
          console.log('Selected segment:', segmentId);
          // TODO: Implement segment selection logic
        }}
      />

      <SelectGame
        open={paddockOpen}
        onClose={() => setPaddockOpen(false)}
        onGameSelect={(game) => {
          console.log('Selected game:', game);
          // TODO: Implement game selection logic
        }}
      />

      <SelectLap
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        sessionInformation={sessionInformation}
        onLapSelect={onLapSelect}
        currentLap={currentLap}
      />
    </Stack>
  )
}
