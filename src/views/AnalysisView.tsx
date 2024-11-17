/**
 * AnalysisView Component
 *
 * Main view component for analyzing telemetry session data. This component handles:
 * - Loading and managing session data
 * - Managing telemetry data for multiple laps
 * - Zoom state for visualization
 * - URL query parameter synchronization
 * - Navigation and paddock UI states
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTelemetry } from '../hooks/useTelemetry'
import { useParams, Navigate } from 'react-router-dom'
import { getLapColor } from '../utils/colors'
import { NumberParam, DelimitedNumericArrayParam, useQueryParam } from 'use-query-params'
import { Box, CircularProgress, Container } from '@mui/material'
import { AnalysisLayout } from '../components/analysis/AnalysisLayout'
import { useSession } from '../hooks/useSession'
import { AnalysisData, TelemetryCacheEntry } from '../services/types'
import { logger } from '../utils/logger'


export function AnalysisView() {
  const { sessionId } = useParams();
  const { getSession, fetchSession } = useSession();

  if (!sessionId) {
    return <Navigate to="/" replace />;
  }

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [lapIds, setLapIds] = useQueryParam('laps', DelimitedNumericArrayParam);
  const [lapsData, setLapsData] = useState<{ [lapId: number]: TelemetryCacheEntry }>({})
  const [zoomStart, setZoomStart] = useQueryParam('zoomStart', NumberParam);
  const [zoomEnd, setZoomEnd] = useQueryParam('zoomEnd', NumberParam);

  // Configure zoom state for the visualization
  // top and bottom are auto-scaled by Chart.js based on data

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
  }, [lapsData, lapIds]);

  const analysisData = useMemo<AnalysisData | undefined>(() => {
    logger.analysis(`Loading analysis data for session ${sessionId}`);
    const session = getSession(sessionId);
    if (!session?.laps) return undefined;

    const filteredLaps = session.laps.filter(lap =>
      lapIds?.includes(lap.id)
    );

    return {
        laps: filteredLaps,
        session: session,
        car: session.car,
        track: session.track,
        game: session.game
    };
  }, [sessionId, lapIds]);

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
                // Find index of this lap in the lapIds array for color assignment
                const lapIndex = lapIds.indexOf(lapId);
                setLapsData(prev => ({
                  ...prev,
                  [lapId]: {
                    ...entry,
                    color: getLapColor(lapIndex)
                  }
                }));
                logger.analysis(`Loaded telemetry for lap ${lapId}`);

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
  }, [lapIds]);


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
          logger.analysis('Initial lapIds:', initialLapIds);
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
    // Get current lap IDs, ensuring we have an array
    const currentLapIds = lapIds?.filter((id): id is number => typeof id === 'number') ?? [];
    logger.analysis('Current lapIds:', currentLapIds);

    // Only add if not already present
    if (!currentLapIds.includes(lapId)) {
      logger.analysis(`Lap ${lapId} selected`);
      // Preserve existing zoom parameters while updating lapIds
      setLapIds([...currentLapIds, lapId]);
      logger.analysis('New lapIds:', [...currentLapIds, lapId]);
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
    <AnalysisLayout
      analysisData={analysisData}
      lapsData={lapsData}
      onLapSelect={handleLapSelect}
      zoomState={{
        start: zoomStart ?? 0,
        end: zoomEnd ?? 100,
        left: 0,
        right: 100,
        top: 100,
        bottom: 0
      }}
      setZoomRange={setZoomRange}
    />
  );
}
