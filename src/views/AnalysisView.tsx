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

import { useState, useEffect, useCallback } from 'react'
import { useTelemetry } from '../hooks/useTelemetry'
import { useParams, Navigate } from 'react-router-dom'
import { getLapColor } from '../utils/colors'
import { NumberParam, DelimitedNumericArrayParam, useQueryParam } from 'use-query-params'
import { Box, CircularProgress, Container } from '@mui/material'
import { AnalysisLayout } from '../components/analysis/AnalysisLayout'
import { useSession } from '../hooks/useSession'
import { AnalysisData, TelemetryCacheEntry } from '../services/types'
import { ZoomState } from '../components/types'
import { logger } from '../utils/logger'


export function AnalysisView() {
  const { sessionId } = useParams();
  const { getSession, fetchSession, getLandmarks, fetchLandmarks } = useSession();

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
  }, [lapsData, lapIds]);

  const [analysisData, setAnalysisData] = useState<AnalysisData>();

  useEffect(() => {
    if (!sessionId) return;

    // Get the session
    const session = getSession(sessionId);
    if (!session?.laps) {
      logger.analysis('Session or laps not yet loaded');
      return;
    }

    // Get the landmarks
    const landmarks = getLandmarks(session.track.id);
    if (!landmarks) {
      logger.analysis('Landmarks not yet loaded');
      return;
    }

    // Only proceed if we have both lapIds and filtered laps
    const filteredLaps = session.laps.filter(lap =>
      lapIds?.includes(lap.id)
    );
    if (!filteredLaps.length) {
      logger.analysis('No matching laps found');
      return;
    }

    // Now we can safely build the analysis data
    const data: AnalysisData = {
      laps: filteredLaps,
      session: session,
      car: session.car,
      track: session.track,
      game: session.game,
      landmarks: landmarks,
      driver: session.driver
    };

    logger.analysis('Analysis data built successfully:', data);
    setAnalysisData(data);
  }, [sessionId, lapIds, getSession, getLandmarks]);

  // Load telemetry data when lap changes
  const { getTelemetryForLap } = useTelemetry();

  // Load telemetry data whenever selected laps change
  /**
   * Loads the session data when the component mounts or sessionId changes
   * Sets initial lap selection if none exists in URL
   * Handles loading state and error handling
   */
  useEffect(() => {
    async function loadTelemetryData() {
      if (!lapIds?.length) return;

      if (!sessionId) return;
      const session = getSession(sessionId);
      if (!session) return;

      try {
        const telemetryUpdates: { [key: number]: TelemetryCacheEntry } = {};
        const promises = lapIds.map(async (lapId) => {
          if (typeof lapId !== 'number' || lapsData[lapId]) return null;

          const lap = session.laps.find(l => l.id === lapId);
          if (!lap) return null;

          const entry = await getTelemetryForLap(sessionId, lapId);
          const lapIndex = lapIds.indexOf(lapId);

          telemetryUpdates[lapId] = {
            ...entry,
            color: getLapColor(lapIndex)
          };

          logger.analysis(`Loaded telemetry for lap ${lapId}`);
          return entry;
        });

        const results = (await Promise.all(promises)).filter((r): r is TelemetryCacheEntry => r !== null);

        // Only update state if we have new data
        if (Object.keys(telemetryUpdates).length > 0) {
          setLapsData(prev => ({
            ...prev,
            ...telemetryUpdates
          }));

          // Set initial zoom range using the first loaded lap
          const firstEntry = results[0];
          if (!zoomStart && !zoomEnd && firstEntry && firstEntry.points.length > 0) {
            const maxDistance = firstEntry.points[firstEntry.points.length - 1].distance;
            setZoomStart(0);
            setZoomEnd(maxDistance);
          }
        }
      } catch (error) {
        console.error('Failed to load telemetry:', error);
        setError('Failed to load telemetry data');
      }
    }

    loadTelemetryData();
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

        // Fetch landmarks for the track right after getting session
        const landmarks = await fetchLandmarks(session.track.id);

        if (!landmarks) {
          throw new Error('Failed to load landmarks');
        } else {
          logger.analysis('Loaded landmarks:', landmarks);
        }


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
      zoomState={zoomState}
      setZoomRange={setZoomRange}
    />
  );
}
