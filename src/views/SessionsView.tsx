import { useEffect } from 'react'
import { ErrorDisplay } from '../components/ErrorDisplay'
import { useErrorHandler } from '../hooks/useErrorHandler'
import { Container, Box, Stack, CircularProgress } from '@mui/material'
import InfiniteScroll from 'react-infinite-scroll-component'
import { NumberParam, useQueryParam } from 'use-query-params'
import { SessionListItem } from '../components/SessionListItem'
import { SessionsViewNav } from '../components/SessionsViewNav'
import { useSession } from '../hooks/useSession'

export function SessionsView() {
  const { handleError, errorState, clearError } = useErrorHandler('api');
  const {
    sessions,
    cars,
    drivers,
    tracks,
    loading,
    error: sessionError,
    hasNextPage,
    fetchSessions,
    fetchMoreSessions,
    selectedCar,
    selectedDriver,
    selectedTrack,
    setSelectedCar: setContextSelectedCar,
    setSelectedDriver: setContextSelectedDriver,
    setSelectedTrack: setContextSelectedTrack
  } = useSession();

  const [urlSelectedCar, setUrlSelectedCar] = useQueryParam('car', NumberParam)
  const [urlSelectedDriver, setUrlSelectedDriver] = useQueryParam('driver', NumberParam)
  const [urlSelectedTrack, setUrlSelectedTrack] = useQueryParam('track', NumberParam)

  // Sync URL params with context
  const handleCarChange = (value: number | null | undefined) => {
    setUrlSelectedCar(value)
    setContextSelectedCar(value)
  }

  const handleDriverChange = (value: number | null | undefined) => {
    setUrlSelectedDriver(value)
    setContextSelectedDriver(value)
  }

  const handleTrackChange = (value: number | null | undefined) => {
    setUrlSelectedTrack(value)
    setContextSelectedTrack(value)
  }

  // Initial data load and URL param sync
  useEffect(() => {
    setContextSelectedCar(urlSelectedCar)
    setContextSelectedDriver(urlSelectedDriver)
    setContextSelectedTrack(urlSelectedTrack)
    fetchSessions(true)
  }, [])

  // Check if we need to load more content when initial content doesn't fill the viewport
  useEffect(() => {
    if (!loading && sessions.length > 0 && hasNextPage) {
      const scrollableDiv = document.getElementById('scrollableDiv');
      if (scrollableDiv && scrollableDiv.scrollHeight <= scrollableDiv.clientHeight) {
        fetchMoreSessions();
      }
    }
  }, [loading, sessions, hasNextPage]);

  // Refresh sessions when selected filters change
  useEffect(() => {
    if ((selectedDriver !== undefined && selectedDriver !== null) ||
        (selectedCar !== undefined && selectedCar !== null) ||
        (selectedTrack !== undefined && selectedTrack !== null)) {
      fetchSessions(false)
    }
  }, [selectedDriver, selectedCar, selectedTrack])

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Handle session errors
  useEffect(() => {
    if (sessionError) {
      handleError(sessionError, 'Failed to load sessions');
    }
  }, [sessionError, handleError]);

  if (errorState?.permanent) {
    return (
      <Container>
        <ErrorDisplay
          error={errorState.message}
          severity={errorState.severity}
          onClose={clearError}
          permanent
        />
      </Container>
    );
  }

  return (
    <>
      <ErrorDisplay
        error={errorState?.message || null}
        severity={errorState?.severity}
        onClose={clearError}
      />
      <Container id="scrollableDiv" style={{ height: '100vh', overflow: 'auto' }}>
      <SessionsViewNav
        cars={cars}
        selectedCar={urlSelectedCar}
        onCarChange={handleCarChange}
        drivers={drivers}
        selectedDriver={urlSelectedDriver}
        onDriverChange={handleDriverChange}
        tracks={tracks}
        selectedTrack={urlSelectedTrack}
        onTrackChange={handleTrackChange}
      />
      <InfiniteScroll
        dataLength={sessions.length}
        next={fetchMoreSessions}
        hasMore={hasNextPage}
        loader={
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress />
          </Box>
        }
        endMessage={
          <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
            No more sessions to load
          </Box>
        }
        scrollableTarget="scrollableDiv"
        scrollThreshold={0.8}
      >
        <Stack sx={{ py: 2 }}>
          {sessions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
              No sessions found
            </Box>
          ) : (
            sessions.map(session => (
              <SessionListItem key={session.id} session={session} />
            ))
          )}
        </Stack>
      </InfiniteScroll>
      </Container>
    </>
  );
}
