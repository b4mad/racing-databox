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

import { useEffect } from 'react'
import { TelemetryCacheEntry } from '../services/types'
import { useSessionLoader } from '../hooks/useSessionLoader'
import { ErrorDisplay } from '../components/ErrorDisplay'
import { useErrorHandler } from '../hooks/useErrorHandler'
import { useTelemetry } from '../hooks/useTelemetry'
import { useParams, Navigate } from 'react-router-dom'
import { getLapColor } from '../utils/colors'
import { Box, CircularProgress, Container } from '@mui/material'
import { AnalysisLayout } from '../components/analysis/AnalysisLayout'
import { useSession } from '../hooks/useSession'
import { logger } from '../utils/logger'
import { useAnalysisState } from '../hooks/useAnalysisState'


export function AnalysisView() {
  const { sessionId } = useParams();
  const { getSession } = useSession();

  if (!sessionId) {
    return <Navigate to="/" replace />;
  }

  const {
    loading,
    analysisData,
    lapsData,
    lapIds,
    setLapIds,
    setLoading,
    setAnalysisData,
    setLapsData,
    handleLapSelect,
    zoomState,
    setZoomRange
  } = useAnalysisState();

  const { error, errorState, handleError, clearError } = useErrorHandler('analysis');

  useSessionLoader({
    sessionId,
    lapIds,
    setLoading,
    setAnalysisData,
    setLapIds
  });


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
      if (!lapIds?.length || !sessionId) return;

      const session = getSession(sessionId);
      if (!session) return;

      // Skip if we already have all the telemetry data for these laps
      const missingLapIds = lapIds.filter(
        lapId => typeof lapId === 'number' && !lapsData[lapId]
      );
      if (missingLapIds.length === 0) return;

      try {
        const telemetryUpdates: { [key: number]: TelemetryCacheEntry } = {};
        const promises = missingLapIds.map(async (lapId) => {
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

        await Promise.all(promises);

        // Only update state if we have new data
        if (Object.keys(telemetryUpdates).length > 0) {
          setLapsData(prev => ({
            ...prev,
            ...telemetryUpdates
          }));
        }
      } catch (error) {
        handleError(error, 'Failed to load telemetry data');
      }
    }

    loadTelemetryData();
  }, [lapIds, sessionId, getSession, getTelemetryForLap, handleError, lapsData, setLapsData]);


  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (errorState?.permanent) {
    return (
      <Container>
        <ErrorDisplay
          error={error}
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
        error={error}
        severity={errorState?.severity}
        onClose={clearError}
      />
      <AnalysisLayout
      analysisData={analysisData}
      lapsData={lapsData}
      onLapSelect={handleLapSelect}
      zoomState={zoomState}
      setZoomRange={setZoomRange}
    />
    </>
  );
}
