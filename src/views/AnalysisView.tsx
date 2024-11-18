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

import { useSessionLoader } from '../hooks/useSessionLoader'
import { ErrorDisplay } from '../components/ErrorDisplay'
import { useErrorHandler } from '../hooks/useErrorHandler'
import { useParams, Navigate } from 'react-router-dom'
import { Box, CircularProgress, Container } from '@mui/material'
import { AnalysisLayout } from '../components/analysis/AnalysisLayout'
import { useAnalysisState } from '../hooks/useAnalysisState'
import { useTelemetryLoader } from '../hooks/useTelemetryLoader'


export function AnalysisView() {
  const { sessionId } = useParams();

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

  const { error, errorState, clearError } = useErrorHandler('analysis');

  useSessionLoader({
    sessionId,
    lapIds,
    setLoading,
    setAnalysisData,
    setLapIds
  });


  useTelemetryLoader({
    lapIds,
    lapsData,
    setLapsData
  });


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
