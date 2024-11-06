import { useState } from 'react'
import { Button, Stack } from '@mui/material'
import { SelectGame } from './SelectGame'
import { SessionNavigation } from './SessionNavigation'
import { LandmarksDialog } from './LandmarksDialog'
import { SessionInformation, TrackLandmarks } from '../services/types'

interface SessionControlsProps {
  paddockOpen: boolean
  setPaddockOpen: (open: boolean) => void
  navigationOpen: boolean
  setNavigationOpen: (open: boolean) => void
  sessionInformation: SessionInformation | null
  onLapSelect: (lap: number) => void
  currentLap: number
  landmarks: TrackLandmarks | null
}

export function SessionControls({
  paddockOpen,
  setPaddockOpen,
  navigationOpen,
  setNavigationOpen,
  sessionInformation,
  onLapSelect,
  currentLap,
  landmarks
}: SessionControlsProps) {
  const [landmarksOpen, setLandmarksOpen] = useState(false);
  return (
    <Stack direction="row" spacing={2}>
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
        Track Landmarks
      </Button>

      <LandmarksDialog
        open={landmarksOpen}
        onClose={() => setLandmarksOpen(false)}
        landmarks={landmarks}
      />

      <SelectGame
        open={paddockOpen}
        onClose={() => setPaddockOpen(false)}
        onGameSelect={(game) => {
          console.log('Selected game:', game);
          // TODO: Implement game selection logic
        }}
      />

      <SessionNavigation
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        sessionInformation={sessionInformation}
        onLapSelect={onLapSelect}
        currentLap={currentLap}
      />
    </Stack>
  )
}
