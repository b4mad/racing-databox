import { useState, useEffect } from 'react'
import { Container, Box, Stack, CircularProgress } from '@mui/material'
import { NumberParam, useQueryParam } from 'use-query-params'
import { SessionListItem } from '../components/SessionListItem'
import { PaddockService } from '../services/PaddockService'
import { PaddockSession, PaddockCar, PaddockDriver, PaddockTrack } from '../services/types'
import { SessionsViewNav } from '../components/SessionsViewNav'

export function SessionsView() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<PaddockSession[]>([])
  const [cars, setCars] = useState<PaddockCar[]>([])
  const [drivers, setDrivers] = useState<PaddockDriver[]>([])
  const [tracks, setTracks] = useState<PaddockTrack[]>([])
  const [selectedCar, setSelectedCar] = useQueryParam('car', NumberParam)
  const [selectedDriver, setSelectedDriver] = useQueryParam('driver', NumberParam)
  const [selectedTrack, setSelectedTrack] = useQueryParam('track', NumberParam)

  const fetchData = async (isInitialLoad = false) => {
    try {
      const paddockService = new PaddockService()

      if (isInitialLoad) {
        const [sessionsData, carsData, driversData, tracksData] = await Promise.all([
          paddockService.getSessions(10, selectedDriver ?? undefined, selectedCar ?? undefined, selectedTrack ?? undefined),
          paddockService.getAllCars(10),
          paddockService.getAllDrivers(10),
          paddockService.getAllTracks(10)
        ])
        setSessions(sessionsData)
        setCars(carsData)
        setDrivers(driversData)
        setTracks(tracksData)
      } else {
        const sessionsData = await paddockService.getSessions(10, selectedDriver, selectedCar, selectedTrack)
        setSessions(sessionsData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      if (process.env.NODE_ENV === 'development') {
        throw err;
      }
    } finally {
      setLoading(false)
    }
  }

  // Initial data load
  useEffect(() => {
    fetchData(true)
  }, [])

  // Refresh sessions when selected driver or car changes
  useEffect(() => {
    if ((selectedDriver !== undefined && selectedDriver !== null) ||
        (selectedCar !== undefined && selectedCar !== null) ||
        (selectedTrack !== undefined && selectedTrack !== null)) {
      fetchData(false)
    }
  }, [selectedDriver, selectedCar])

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ p: 2, color: 'error.main' }}>
          Error: {error}
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <SessionsViewNav
        cars={cars}
        selectedCar={selectedCar}
        onCarChange={setSelectedCar}
        drivers={drivers}
        selectedDriver={selectedDriver}
        onDriverChange={setSelectedDriver}
        tracks={tracks}
        selectedTrack={selectedTrack}
        onTrackChange={setSelectedTrack}
      />
      <Stack sx={{ height: "100vh", py: 2 }}>
        {sessions
          .filter(session =>
            (!selectedCar || session.car.id === selectedCar) &&
            (!selectedDriver || session.driver.id === selectedDriver) &&
            (!selectedTrack || session.track.id === selectedTrack)
          )
          .map(session => (
            <SessionListItem key={session.sessionId} session={session} />
          ))}
      </Stack>
    </Container>
  );
}
