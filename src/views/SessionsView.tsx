import { useState, useEffect } from 'react'
import { Container, Box, Stack, CircularProgress } from '@mui/material'
import { NumberParam, useQueryParam } from 'use-query-params'
import { SessionListItem } from '../components/SessionListItem'
import { PaddockService } from '../services/PaddockService'
import { PaddockSession, PaddockCar, PaddockDriver } from '../services/types'
import { SessionsViewNav } from '../components/SessionsViewNav'

export function SessionsView() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<PaddockSession[]>([])
  const [cars, setCars] = useState<PaddockCar[]>([])
  const [drivers, setDrivers] = useState<PaddockDriver[]>([])
  const [selectedCar, setSelectedCar] = useQueryParam('car', NumberParam)
  const [selectedDriver, setSelectedDriver] = useQueryParam('driver', NumberParam)

  const fetchData = async () => {
    try {
      const paddockService = new PaddockService()
      const [sessionsData, carsData, driversData] = await Promise.all([
        paddockService.getSessions(),
        paddockService.getAllCars(10),
        paddockService.getAllDrivers(10)
      ])
      setSessions(sessionsData)
      setCars(carsData)
      setDrivers(driversData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
      if (process.env.NODE_ENV === 'development') {
        throw err;
      }
    } finally {
      setLoading(false)
    }
  }

  // Initial data load
  useEffect(() => {
    fetchData()
  }, [])

  // Refresh sessions when selected driver changes
  useEffect(() => {
    const refreshSessions = async () => {
      try {
        const paddockService = new PaddockService()
        const sessionsData = await paddockService.getSessions(10, selectedDriver)
        setSessions(sessionsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh sessions')
      }
    }
    
    if (selectedDriver !== undefined) {
      refreshSessions()
    }
  }, [selectedDriver])

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
      />
      <Stack sx={{ height: "100vh", py: 2 }}>
        {sessions
          .filter(session =>
            (!selectedCar || session.car.id === selectedCar) &&
            (!selectedDriver || session.driver.id === selectedDriver)
          )
          .map(session => (
            <SessionListItem key={session.sessionId} session={session} />
          ))}
      </Stack>
    </Container>
  );
}
