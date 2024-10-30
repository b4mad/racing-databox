import { useState, useEffect } from 'react'
import './App.css'
import { Grid } from '@mui/material'
import { Map } from './components/Map'
import { createTelemetryService } from './services/TelemetryService'
import { TelemetryPoint, SessionData } from './services/types'

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
  return pathParts[pathParts.length - 2] // Assuming URL pattern is /session/{sessionId}/{lapNumber}
}

function App() {
  const [data, setData] = useState<MapPoint[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const service = createTelemetryService()
        // const sessionId = getSessionIdFromUrl()
        const sessionId = '1729092115'
        const session = await service.getSessionData(sessionId)
        setSessionData(session)

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

  return (
    <Grid
      container
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <Grid item xs={12} sx={{ height: '100%' }}>
        {loading ? (
          <div>Loading map data...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <Map data={data} />
        )}
      </Grid>
    </Grid>
  )
}

export default App
