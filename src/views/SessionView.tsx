import { useState, useEffect, useMemo } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Container, Box, Stack, CircularProgress } from '@mui/material'
import { SessionControls } from '../components/SessionControls'
import { TelemetryVisualization } from '../components/TelemetryVisualization'
import { createTelemetryService } from '../services/TelemetryService'
import { PaddockService } from '../services/PaddockService'
import { TelemetryPoint, SessionData, SessionInformation, PaddockLap, PaddockSession, TrackLandmarks } from '../services/types'
import { ZoomState } from '../components/types'

interface PaddockSessionData {
  session: PaddockSession;
  laps: PaddockLap[];
}

export function SessionView() {
  const { sessionId, lapNumber: _lapNumber } = useParams();

  if (!sessionId) {
    return <Navigate to="/" replace />;
  }

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [paddockLaps, setPaddockLaps] = useState<PaddockLap[]>([])
  const [paddockData, setPaddockData] = useState<PaddockSessionData | null>(null)
  const [landmarks, setLandmarks] = useState<TrackLandmarks | null>(null)
  const [currentLap, setCurrentLap] = useState<number>(0)
  const [currentLapData, setCurrentLapData] = useState<TelemetryPoint[]>([])
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [paddockOpen, setPaddockOpen] = useState(false)
  const [zoomState, setZoomState] = useState<ZoomState>({
    left: 0,
    right: 'dataMax+1',
    top: 'dataMax+1',
    bottom: 'dataMin-1'
  })

  const setZoomRange = (startMeters: number, endMeters: number) => {
    if (currentLapData.length === 0) return;
    const maxDistance = currentLapData[currentLapData.length - 1].distance;

    // Clamp values to valid range
    const start = Math.max(0, Math.min(startMeters, maxDistance));
    const end = Math.max(0, Math.min(endMeters, maxDistance));

    setZoomState({
      ...zoomState,
      left: start,
      right: end,
      // Keep default top/bottom scaling
      top: 'dataMax+1',
      bottom: 'dataMin-1'
    });
  };

  const sessionInformation = useMemo<SessionInformation | null>(() => {
    if (!sessionData) return null;
    return {
      laps: sessionData.laps,
      mapDataAvailable: sessionData.mapDataAvailable,
      lapDetails: paddockLaps
    };
  }, [sessionData, paddockLaps]);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const telemetryService = createTelemetryService()
        const paddockService = new PaddockService()
        const [session, paddockData] = await Promise.all([
          telemetryService.getSessionData(sessionId),
          paddockService.getSessionData(sessionId)
        ]);

        // Select the first session from the array
        // FIXME: if there are multiple sessions, we should allow the user to select one
        const firstSession = paddockData[0];
        setPaddockData(firstSession)
        setPaddockLaps(firstSession.laps)
        setSessionData(session)

        // Fetch landmarks for the track
        if (firstSession.session.track.id) {
          const trackLandmarks = await paddockService.getLandmarks(firstSession.session.track.id)
          setLandmarks(trackLandmarks)
        }

        if (session.laps.length > 0) {
          const firstLap = session.laps[0];
          setCurrentLap(firstLap);
          const firstLapData = session.telemetryByLap.get(firstLap);
          if (firstLapData) {
            setCurrentLapData(firstLapData);
          }
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session data')
        if (process.env.NODE_ENV === 'development') {
          throw err;
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSessionData()
  }, [sessionId])

  const handleLapSelect = (lap: number) => {
    setCurrentLap(lap)
    if (sessionData) {
      const lapData = sessionData.telemetryByLap.get(lap)
      if (lapData) {
        setCurrentLapData(lapData)
      }
    }
  }

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
      <Stack sx={{ height: "100vh", borderRadius: 1 }}>
        <Box sx={{ height: "10vh" }}>
          <SessionControls
            paddockOpen={paddockOpen}
            setPaddockOpen={setPaddockOpen}
            navigationOpen={navigationOpen}
            setNavigationOpen={setNavigationOpen}
            sessionInformation={sessionInformation}
            onLapSelect={handleLapSelect}
            currentLap={currentLap}
            landmarks={landmarks}
            currentLapData={currentLapData}
            setZoomRange={setZoomRange}
          />
        </Box>
        <Box sx={{ height: "90vh" }}>
          <TelemetryVisualization
            currentLapData={currentLapData}
            mapDataAvailable={sessionData?.mapDataAvailable ?? false}
            session={paddockData?.session ?? null}
            zoomState={zoomState}
          />
        </Box>
      </Stack>
    </Container>
  );
}
