import { useState, useEffect } from 'react'
import './App.css'
import { Grid } from '@mui/material'
import { Map } from './components/Map'
import { createTelemetryService } from './services/TelemetryService'
import { TelemetryPoint } from './services/types'

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

function App() {
  const [data, setData] = useState<MapPoint[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const service = createTelemetryService()
        const telemetryData = await service.getLapData(1792718)

        if (!telemetryData.mapDataAvailable) {
          throw new Error('Map data is not available')
        }

        const mapPoints = telemetryData.points.map((point: TelemetryPoint) => ({
          x: point.position!.x,
          y: point.position!.z,
          timestamp: formatTime(point.lapTime)
        }))

        setData(mapPoints)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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
