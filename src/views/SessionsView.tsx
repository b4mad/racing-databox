import { useState, useEffect } from 'react'
import { Container, Box, Stack, CircularProgress } from '@mui/material'
import { SessionListItem } from '../components/SessionListItem'
import { PaddockService } from '../services/PaddockService'
import { PaddockSession } from '../services/types'

export function SessionsView() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<PaddockSession[]>([])

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const paddockService = new PaddockService()
        const sessionsData = await paddockService.getSessions()
        setSessions(sessionsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sessions')
        if (process.env.NODE_ENV === 'development') {
          throw err;
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

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
      <Stack sx={{ height: "100vh", py: 2 }}>
        {sessions.map(session => (
          <SessionListItem key={session.sessionId} session={session} />
        ))}
      </Stack>
    </Container>
  );
}
