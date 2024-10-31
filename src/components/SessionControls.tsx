import { Button, Stack } from '@mui/material'
import { PaddockNavigation } from './PaddockNavigation'
import { SessionNavigation } from './SessionNavigation'
import { SessionInformation } from '../services/types'

interface SessionControlsProps {
  paddockOpen: boolean
  setPaddockOpen: (open: boolean) => void
  navigationOpen: boolean
  setNavigationOpen: (open: boolean) => void
  sessionInformation: SessionInformation | null
  onLapSelect: (lap: number) => void
  currentLap: number
}

export function SessionControls({
  paddockOpen,
  setPaddockOpen,
  navigationOpen,
  setNavigationOpen,
  sessionInformation,
  onLapSelect,
  currentLap
}: SessionControlsProps) {
  return (
    <Stack direction="row" spacing={2}>
      <Button variant="contained" onClick={() => setPaddockOpen(true)}>
        Select Game
      </Button>
      <Button variant="contained" onClick={() => setNavigationOpen(true)}>
        Select Lap
      </Button>

      <PaddockNavigation
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
