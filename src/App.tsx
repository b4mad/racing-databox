import { useState, useEffect, useMemo } from 'react'
import './App.css'
import Grid from '@mui/material/Grid2';
import { Button, Container, Box, Stack } from '@mui/material';
import { SessionNavigation } from './components/SessionNavigation';
import { PaddockNavigation } from './components/PaddockNavigation';
import { Map } from './components/Map'
import { MapLine } from './components/MapLine'
import { LineGraph } from './components/LineGraph'
import { createTelemetryService } from './services/TelemetryService'
import { PaddockService } from './services/PaddockService'
import { TelemetryPoint, SessionData, ProcessedTelemetryData, SessionInformation, PaddockLap } from './services/types'


function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = (seconds % 60).toFixed(3)
  return `${minutes}:${remainingSeconds.padStart(6, '0')}`
}

const getSessionIdFromUrl = () => {
  const pathParts = window.location.pathname.split('/')
  const sessionId = pathParts[pathParts.length - 2] // Assuming URL pattern is /session/{sessionId}/{lapNumber}
  // return sessionId || '1730284531'
  return sessionId || '1729092115'
}

function App() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [paddockLaps, setPaddockLaps] = useState<PaddockLap[]>([]);

  const sessionInformation = useMemo<SessionInformation | null>(() => {
    if (!sessionData) return null;
    return {
      laps: sessionData.laps,
      mapDataAvailable: sessionData.mapDataAvailable,
      lapDetails: paddockLaps
    };
  }, [sessionData, paddockLaps]);
  const [currentLap, setCurrentLap] = useState<number>(0)
  const [currentLapData, setCurrentLapData] = useState<TelemetryPoint[]>([])
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [paddockOpen, setPaddockOpen] = useState(false)

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const telemetryService = createTelemetryService()
        const paddockService = new PaddockService()
        const sessionId = getSessionIdFromUrl()

        // Fetch both telemetry and paddock data
        const [session, paddockData] = await Promise.all([
          telemetryService.getSessionData(sessionId),
          paddockService.getSessionData(sessionId)
        ]);


        setPaddockLaps(paddockData.laps);
        setSessionData(session)

        // Set initial lap and its data
        if (session.laps.length > 0) {
          const firstLap = session.laps[0];
          setCurrentLap(firstLap);
          const firstLapData = session.telemetryByLap.get(firstLap);
          if (firstLapData) {
            setCurrentLapData(firstLapData);
          }
        }

        if (!session.mapDataAvailable) {
          throw new Error('Map data is not available')
        }

        // Get the first lap's data
        const firstLap = session.laps[0]
        const firstLapData = session.telemetryByLap.get(firstLap)

        if (!firstLapData) {
          throw new Error('No data available for first lap')
        }

        setCurrentLapData(firstLapData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session data')
        if (process.env.NODE_ENV === 'development') {
          throw err; // Re-throw in development mode for better debugging
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSessionData()
  }, [])

  const handleLapSelect = (lap: number) => {
    setCurrentLap(lap)
    // Update both map data and telemetry data for the selected lap
    if (sessionData) {
      const lapData = sessionData.telemetryByLap.get(lap)
      if (lapData) {
        setCurrentLapData(lapData)
      }
    }
  }

  return (
    <Container>
      <Stack
        sx={{
          height: "100vh",
          borderRadius: 1,
        }}
      >
        <Box sx={{ height: "10vh" }}>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={() => setPaddockOpen(true)}>
              Select Game
            </Button>
            <Button variant="contained" onClick={() => setNavigationOpen(true)}>
              Select Lap
            </Button>
          </Stack>

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
            onLapSelect={handleLapSelect}
            currentLap={currentLap}
          />
        </Box>
        <Box sx={{ height: "90vh" }}>
          <Grid container spacing={2} sx={{ height: "100%" }}>
            <Grid size={6}>
              <Box sx={{ height: "50%" }}>
                <MapLine data={currentLapData} />
              </Box>
              {/* <Box sx={{ height: "50%" }}>
                <Map data={currentLapData} />
              </Box> */}
            </Grid>
            <Grid size={6}>
              <Stack>
                {currentLapData.length > 0 && (
                  <Box sx={{ height: "200px" }}>
                    <LineGraph
                      data={currentLapData}
                      dataKey="speed"
                      name="Speed"
                      unit="km/h"
                      color="#2196f3"
                    />
                  </Box>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Stack>

    </Container>
  );
}

export default App
