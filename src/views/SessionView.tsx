import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTelemetry } from '../hooks/useTelemetry'
import { useParams, Navigate } from 'react-router-dom'
import { NumberParam, useQueryParam } from 'use-query-params'
import { Container, Box, Stack, CircularProgress } from '@mui/material'
import { useSession } from '../hooks/useSession'
import { SessionControls } from '../components/SessionControls'
import { TelemetryVisualization } from '../components/TelemetryVisualization'
import { SessionInformation, TelemetryCacheEntry } from '../services/types'
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
  const [lapsData, setLapsData] = useState<{ [lapNumber: number]: TelemetryCacheEntry }>({})
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
    const currentLapEntry = lapsData[currentLap ?? 0];
    if (!currentLapEntry?.points.length) return;
    const maxDistance = currentLapEntry.points[currentLapEntry.points.length - 1].distance;

    // Clamp values to valid range
    const start = Math.max(0, Math.min(startMeters, maxDistance));
    const end = Math.max(0, Math.min(endMeters, maxDistance));

    setZoomStart(start);
    setZoomEnd(end);
  }, [lapsData, currentLap, setZoomStart, setZoomEnd]);

  const sessionInformation = useMemo<SessionInformation | undefined>(() => {
    const session = getSession(sessionId);
    if (!session?.laps) return undefined;
    return {
      laps: session.laps.map(lap => lap.number),
      mapDataAvailable: session.laps.some(lap => lap.telemetry?.some(point => point.position)),
      lapDetails: session.laps
    };
  }, [sessionId, getSession]);

  // Load telemetry data when lap changes
  const { getTelemetryForLap } = useTelemetry();

  useEffect(() => {
    if (currentLap) {
      const session = getSession(sessionId);
      if (session) {
        const lap = session.laps.find(l => l.number === currentLap);
        if (lap) {
          getTelemetryForLap(sessionId, lap.id)
            .then(entry => setLapsData(prev => ({
              ...prev,
              [currentLap]: entry
            })))
            .catch(error => {
              console.error('Failed to load telemetry:', error);
              setError('Failed to load telemetry data');
            });
        }
      }
    }
  }, [sessionId, currentLap, getSession, getTelemetryForLap]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const session = await fetchSession(sessionId);

        if (session.laps.length > 0) {
          // If no lap is set in URL, use first lap
          const targetLap = currentLap || session.laps[0].number;
          const selectedLap = session.laps.find(l => l.number === targetLap)?.number || session.laps[0].number;

          setCurrentLap(selectedLap);

          // Fetch telemetry for the selected lap
          const selectedLapId = session.laps.find(l => l.number === selectedLap)?.id;
          if (!selectedLapId) {
            throw new Error(`Could not find lap with number ${selectedLap}`);
          }
          const telemetry = await getTelemetryForLap(sessionId, selectedLapId);
          setLapsData({ [selectedLap]: telemetry });

          if (telemetry.points.length > 0) {
            const maxDistance = telemetry.points[telemetry.points.length - 1].distance;

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
    const session = getSession(sessionId);
    const selectedLap = session?.laps.find(l => l.number === lap);
    if (!selectedLap) {
      console.error(`Could not find lap with number ${lap}`);
      return;
    }

    getTelemetryForLap(sessionId, selectedLap.id)
      .then(entry => setLapsData(prev => ({
        ...prev,
        [lap]: entry
      })))
      .catch(error => {
        console.error('Failed to load telemetry:', error);
        setError('Failed to load telemetry data');
      });
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
            landmarks={undefined} // TODO: Implement landmarks fetching
            currentLapData={lapsData[currentLap ?? 0]?.points ?? []}
            setZoomRange={setZoomRange}
          />
        </Box>
        <Box sx={{ height: "90vh" }}>
          <TelemetryVisualization
            currentLapData={lapsData[currentLap ?? 0]?.points ?? []}
            session={getSession(sessionId) || null}
            zoomState={zoomState}
            setZoomRange={setZoomRange}
            lapsData={lapsData}
          />
        </Box>
      </Stack>
    </Container>
  );
}
