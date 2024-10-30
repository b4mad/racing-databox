import { useState, useEffect } from 'react'
import './App.css'
import Grid from '@mui/material/Grid2';
import { Button, Container, Box, Stack } from '@mui/material';
import { SessionNavigation } from './components/SessionNavigation';
import { Map } from './components/Map'
import { LineGraph } from './components/LineGraph'
import { createTelemetryService } from './services/TelemetryService'
import { TelemetryPoint, SessionData, ProcessedTelemetryData } from './services/types'


function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = (seconds % 60).toFixed(3)
  return `${minutes}:${remainingSeconds.padStart(6, '0')}`
}

const getSessionIdFromUrl = () => {
  const pathParts = window.location.pathname.split('/')
  const sessionId = pathParts[pathParts.length - 2] // Assuming URL pattern is /session/{sessionId}/{lapNumber}
  return sessionId || '1730284531'
  return sessionId || '1729092115'
}

function App() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [currentLap, setCurrentLap] = useState<number>(0)
  const [currentLapData, setCurrentLapData] = useState<TelemetryPoint[]>([])
  const [navigationOpen, setNavigationOpen] = useState(false)

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const service = createTelemetryService()
        const sessionId = getSessionIdFromUrl()
        // const sessionId = '1729092115'
        const session = await service.getSessionData(sessionId)
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
        if (import.meta.env.DEV) {
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
          <Button variant="contained" onClick={() => setNavigationOpen(true)}>
            Select Lap
          </Button>

          <SessionNavigation
            open={navigationOpen}
            onClose={() => setNavigationOpen(false)}
            sessionData={sessionData}
            onLapSelect={handleLapSelect}
            currentLap={currentLap}
          />
        </Box>
        <Box sx={{ height: "90vh" }}>
          <Grid container spacing={2} sx={{ height: "100%" }}>
            <Grid size={6}>
              <Box sx={{ height: "50%" }}>
                <Map data={currentLapData} />
              </Box>
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

      {/*

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ height: '50vh' }}>
          <Map data={currentLapData} />
        </Box>

        {currentLapData.length > 0 && (
          <Box sx={{ height: '200px' }}>
            <LineGraph
              data={currentLapData}
              dataKey="speed"
              name="Speed"
              unit="km/h"
              color="#2196f3"
            />
          </Box>
        )}
      </Box> */}
    </Container>
  );
}

export default App
