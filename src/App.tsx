import { useState, useEffect } from 'react'
import './App.css'
import Grid2 from '@mui/material/Grid2';
import { Button } from '@mui/material';
import { SessionNavigation } from './components/SessionNavigation';
import { Map } from './components/Map'
import { LineGraph } from './components/LineGraph'
import { createTelemetryService } from './services/TelemetryService'
import { TelemetryPoint, SessionData, ProcessedTelemetryData } from './services/types'

interface MapPoint {
  x: number
  y: number
  timestamp: string
}

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
  const [data, setData] = useState<MapPoint[]>([])
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

        const mapPoints = firstLapData.map((point: TelemetryPoint) => ({
          x: point.position!.x,
          y: point.position!.z,
          timestamp: formatTime(point.lapTime)
        }))

        setData(mapPoints)
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
        const mapPoints = lapData.map((point: TelemetryPoint) => ({
          x: point.position!.x,
          y: point.position!.z,
          timestamp: formatTime(point.lapTime)
        }))
        setData(mapPoints)
      }
    }
  }

  return (
    <>
      <Button
        variant="contained"
        onClick={() => setNavigationOpen(true)}
        sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}
      >
        Select Lap
      </Button>

      <SessionNavigation
        open={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        sessionData={sessionData}
        onLapSelect={handleLapSelect}
        currentLap={currentLap}
      />

      <Grid2
        container
        spacing={2}
      >
      <Grid2 size={ 6 } >
        {loading ? (
          <div>Loading map data...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <Map data={data} />
        )}
      </Grid2>

      {currentLapData.length > 0 && (
          <Grid2 size={12}>
            <LineGraph
              data={currentLapData}
              dataKey="speed"
              name="Speed"
              unit="km/h"
              color="#2196f3"
            />
          </Grid2>
      )}
    </Grid2>
    </>
  )
}

export default App
