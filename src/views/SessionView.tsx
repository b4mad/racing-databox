/**
 * SessionView Component
 *
 * Main view component for displaying telemetry session data. This component handles:
 * - Loading and managing session data
 * - Managing telemetry data for multiple laps
 * - Zoom state for visualization
 * - URL query parameter synchronization
 * - Navigation and paddock UI states
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTelemetry } from '../hooks/useTelemetry'
import { useParams, Navigate } from 'react-router-dom'
import { NumberParam, DelimitedNumericArrayParam, useQueryParam } from 'use-query-params'
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
  const [lapIds, setLapIds] = useQueryParam('laps', DelimitedNumericArrayParam);
  const [lapsData, setLapsData] = useState<{ [lapId: number]: TelemetryCacheEntry }>({})
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [paddockOpen, setPaddockOpen] = useState(false)
  const [zoomStart, setZoomStart] = useQueryParam('zoomStart', NumberParam);
  const [zoomEnd, setZoomEnd] = useQueryParam('zoomEnd', NumberParam);

  // Configure zoom state for the visualization
  // top and bottom are auto-scaled by Chart.js based on data
  const zoomState: ZoomState = {
    left: zoomStart || 0,      // Start of visible range in meters
    right: zoomEnd || 0,       // End of visible range in meters
    top: 0,                    // Will be auto-scaled by Chart.js
    bottom: 0                  // Will be auto-scaled by Chart.js
  }

  /**
   * Updates the zoom range for the telemetry visualization
   * Ensures the range stays within valid bounds (0 to max lap distance)
   * Updates URL parameters to persist zoom state
   */
  const setZoomRange = useCallback((startMeters: number, endMeters: number) => {
    const firstLapId = lapIds?.[0] ?? 0;
    const firstLapEntry = lapsData[typeof firstLapId === 'number' ? firstLapId : 0];
    if (!firstLapEntry?.points.length) return;

    // Get the total distance of the lap for bounds checking
    const maxDistance = firstLapEntry.points[firstLapEntry.points.length - 1].distance;

    // Clamp values to valid range (0 to maxDistance)
    const start = Math.max(0, Math.min(startMeters, maxDistance));
    const end = Math.max(0, Math.min(endMeters, maxDistance));

    // Update URL parameters with new zoom range
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

  // Load telemetry data whenever selected laps change
  /**
   * Loads the session data when the component mounts or sessionId changes
   * Sets initial lap selection if none exists in URL
   * Handles loading state and error handling
   */
  useEffect(() => {
    if (lapIds?.length) {
      const session = getSession(sessionId);
      if (session) {
        // Load telemetry data for each selected lap that hasn't been loaded yet
        lapIds.forEach(lapId => {
          if (typeof lapId === 'number' && !lapsData[lapId]) {
            const lap = session.laps.find(l => l.id === lapId);
            if (!lap) return;

            // Fetch telemetry data and update state
            getTelemetryForLap(sessionId, lapId)
              .then(entry => {
                setLapsData(prev => ({
                  ...prev,
                  [lapId]: entry
                }));

                // Set initial zoom range to full lap distance when first lap's telemetry loads
                if (!zoomStart && !zoomEnd && entry.points.length > 0) {
                  const maxDistance = entry.points[entry.points.length - 1].distance;
                  setZoomStart(0);
                  setZoomEnd(maxDistance);
                }
              })
              .catch(error => {
                console.error('Failed to load telemetry:', error);
                setError('Failed to load telemetry data');
              });
          }
        });
      }
    }
  }, [sessionId, lapIds]);


  /**
   * Asynchronously loads the session data based on the provided sessionId.
   *
   * This function sets the loading state to true while fetching the session data.
   * If the session contains laps and no lap is set in the URL, it uses the first lap's ID.
   * It also handles any errors that occur during the fetch operation, setting an error message
   * if an error is caught. In development mode, it rethrows the error for debugging purposes.
   * Finally, it sets the loading state to false once the operation is complete.
   *
   * @async
   * @function loadSession
   * @throws Will throw an error in development mode if fetching the session data fails.
   */
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const session = await fetchSession(sessionId);

        if (session.laps.length > 0) {
          // If no lap is set in URL, use first lap
          const initialLapIds = lapIds?.length ? lapIds : [session.laps[0].id];
          setLapIds(initialLapIds);

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

  /**
   * Handles lap selection/deselection in the UI
   * Maintains the selected laps in URL parameters
   * Ensures at least one lap is always selected
   */
  const handleLapSelect = (lapId: number) => {
    const currentLapIds = lapIds?.filter((id): id is number => typeof id === 'number') ?? [];

    // Toggle lap selection
    const newLapIds = currentLapIds.includes(lapId)
      ? currentLapIds.filter(id => id !== lapId)  // Remove if already selected
      : [...currentLapIds, lapId];                // Add if not selected

    // Update URL parameters, ensuring at least one lap remains selected
    setLapIds(newLapIds.length ? newLapIds : [lapId]);
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
            currentLap={Number(lapIds?.[0]) || 0}
            landmarks={undefined} // TODO: Implement landmarks fetching
            currentLapData={lapsData[Number(lapIds?.[0]) || 0]?.points ?? []}
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
