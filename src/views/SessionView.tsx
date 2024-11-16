import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTelemetry } from '../hooks/useTelemetry'
import { useParams, Navigate } from 'react-router-dom'
import { NumberParam, ArrayParam, useQueryParam } from 'use-query-params'
import { Container, Box, Stack, CircularProgress } from '@mui/material'
import { useSession } from '../hooks/useSession'
import { SessionControls } from '../components/SessionControls'
import { TelemetryVisualization } from '../components/TelemetryVisualization'
import { AnalysisData, TelemetryCacheEntry } from '../services/types'
import { ZoomState } from '../components/types'


export function SessionView() {
  const { sessionId } = useParams();
  const { getSession, fetchSession } = useSession();

  if (!sessionId) {
    return <Navigate to="/" replace />;
  }

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [lapIds, setLapIds] = useQueryParam('laps', ArrayParam);
  const [lapsData, setLapsData] = useState<{ [lapId: number]: TelemetryCacheEntry }>({})
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
    const firstLapEntry = lapsData[lapIds?.[0] ?? 0];
    if (!firstLapEntry?.points.length) return;
    const maxDistance = firstLapEntry.points[firstLapEntry.points.length - 1].distance;

    // Clamp values to valid range
    const start = Math.max(0, Math.min(startMeters, maxDistance));
    const end = Math.max(0, Math.min(endMeters, maxDistance));

    setZoomStart(start);
    setZoomEnd(end);
  }, [lapsData, lapIds, setZoomStart, setZoomEnd]);

  const analysisData = useMemo<AnalysisData | undefined>(() => {
    const session = getSession(sessionId);
    if (!session?.laps) return undefined;

    return {
        laps: session.laps
    };
  }, [sessionId]);

  // Load telemetry data when lap changes
  const { getTelemetryForLap } = useTelemetry();

  useEffect(() => {
    if (lapIds?.length) {
      const session = getSession(sessionId);
      if (session) {
        lapIds.forEach(lapId => {
          const lap = session.laps.find(l => l.id === lapId);
          if (lap && !lapsData[lapId]) {
            getTelemetryForLap(sessionId, lapId)
              .then(entry => setLapsData(prev => ({
                ...prev,
                [lapId]: entry
              })))
              .catch(error => {
                console.error('Failed to load telemetry:', error);
                setError('Failed to load telemetry data');
              });
          }
        });
      }
    }
  }, [sessionId, lapIds]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const session = await fetchSession(sessionId);

        if (session.laps.length > 0) {
          // If no lap is set in URL, use first lap
          const initialLapIds = lapIds?.length ? lapIds : [session.laps[0].id];
          setLapIds(initialLapIds);

          // Fetch telemetry for all selected laps
          const telemetryPromises = initialLapIds.map(lapId =>
            getTelemetryForLap(sessionId, lapId)
              .then(telemetry => ({ lapId, telemetry }))
          );

          const results = await Promise.all(telemetryPromises);
          const newLapsData = Object.fromEntries(
            results.map(({ lapId, telemetry }) => [lapId, telemetry])
          );
          setLapsData(newLapsData);

          // Use the first lap's telemetry for initial zoom range
          const firstTelemetry = results[0]?.telemetry;
          if (firstTelemetry?.points.length > 0) {
            const maxDistance = firstTelemetry.points[firstTelemetry.points.length - 1].distance;
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
  }, [sessionId]);

  const handleLapSelect = (lapId: number) => {
    const newLapIds = lapIds?.includes(lapId)
      ? lapIds.filter(id => id !== lapId)  // Remove if already selected
      : [...(lapIds || []), lapId];        // Add if not selected

    setLapIds(newLapIds.length ? newLapIds : [lapId]); // Ensure at least one lap is selected
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
            sessionInformation={analysisData}
            onLapSelect={handleLapSelect}
            currentLap={lapIds?.[0] ?? 0}
            landmarks={undefined} // TODO: Implement landmarks fetching
            currentLapData={lapsData[lapIds?.[0] ?? 0]?.points ?? []}
            setZoomRange={setZoomRange}
          />
        </Box>
        <Box sx={{ height: "90vh" }}>
          <TelemetryVisualization
            currentLapData={lapsData[lapIds?.[0] ?? 0]?.points ?? []}
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
