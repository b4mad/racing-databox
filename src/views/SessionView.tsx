import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { NumberParam, useQueryParam } from 'use-query-params'
import { Container, Box, Stack, CircularProgress } from '@mui/material'
import { useSession } from '../hooks/useSession'
import { SessionControls } from '../components/SessionControls'
import { TelemetryVisualization } from '../components/TelemetryVisualization'
import { TelemetryPoint, SessionInformation } from '../services/types'
import { ZoomState } from '../components/types'


export function SessionView() {
  const { sessionId } = useParams();
  const { getSession, fetchSession } = useSession();

  if (!sessionId) {
    return <Navigate to="/" replace />;
  }

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentLap, setCurrentLap] = useQueryParam('lap', NumberParam);
  const [currentLapData, setCurrentLapData] = useState<TelemetryPoint[]>([])
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [paddockOpen, setPaddockOpen] = useState(false)
  const [zoomStart, setZoomStart] = useQueryParam('zoomStart', NumberParam);
  const [zoomEnd, setZoomEnd] = useQueryParam('zoomEnd', NumberParam);

  const zoomState: ZoomState = {
    left: zoomStart || 0,
    right: zoomEnd || 0,
    top: 0,   // Will be auto-scaled by Chart.js
    bottom: 0 // Will be auto-scaled by Chart.js
  }

  const setZoomRange = useCallback((startMeters: number, endMeters: number) => {
    if (currentLapData.length === 0) return;
    const maxDistance = currentLapData[currentLapData.length - 1].distance;

    // Clamp values to valid range
    const start = Math.max(0, Math.min(startMeters, maxDistance));
    const end = Math.max(0, Math.min(endMeters, maxDistance));

    setZoomStart(start);
    setZoomEnd(end);
  }, [currentLapData, setZoomStart, setZoomEnd]);

  const sessionInformation = useMemo<SessionInformation | null>(() => {
    const cachedSession = getSession(sessionId);
    if (!cachedSession?.sessionData) return null;
    return {
      laps: cachedSession.sessionData.laps,
      mapDataAvailable: cachedSession.sessionData.mapDataAvailable,
      lapDetails: cachedSession.paddockData.laps
    };
  }, [sessionId, getSession]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const cachedSession = await fetchSession(sessionId);

        if (cachedSession.sessionData.laps.length > 0) {
          // If no lap is set in URL, use first lap
          const targetLap = currentLap || cachedSession.sessionData.laps[0];
          const selectedLap = cachedSession.sessionData.laps.includes(targetLap)
            ? targetLap
            : cachedSession.sessionData.laps[0];

          setCurrentLap(selectedLap);
          const lapData = cachedSession.sessionData.telemetryByLap.get(selectedLap);

          if (lapData) {
            setCurrentLapData(lapData);
            const maxDistance = lapData[lapData.length - 1].distance;

            // New lap selected - initialize zoom range
            setZoomStart(zoomStart || 0);
            setZoomEnd(zoomEnd || maxDistance);
          }
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session data');
        if (process.env.NODE_ENV === 'development') {
          throw err;
        }
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, fetchSession, currentLap, zoomStart, zoomEnd]);

  const handleLapSelect = (lap: number) => {
    setCurrentLap(lap);
    const cachedSession = getSession(sessionId);
    if (cachedSession?.sessionData) {
      const lapData = cachedSession.sessionData.telemetryByLap.get(lap);
      if (lapData) {
        setCurrentLapData(lapData);
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
            currentLap={currentLap ?? 0}
            landmarks={getSession(sessionId)?.landmarks}
            currentLapData={currentLapData}
            setZoomRange={setZoomRange}
          />
        </Box>
        <Box sx={{ height: "90vh" }}>
          <TelemetryVisualization
            currentLapData={currentLapData}
            mapDataAvailable={getSession(sessionId)?.sessionData.mapDataAvailable ?? false}
            session={getSession(sessionId)?.paddockData ?? null}
            zoomState={zoomState}
            setZoomRange={setZoomRange}
          />
        </Box>
      </Stack>
    </Container>
  );
}
