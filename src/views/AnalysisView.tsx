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
import { useParams, Navigate } from 'react-router-dom'
import { Box, CircularProgress, Container } from '@mui/material'
import { AnalysisLayout } from '../components/analysis/AnalysisLayout'
import { useTelemetryLoader } from '../hooks/useTelemetryLoader'
import { AnalysisProvider, useAnalysisContext } from '../contexts/AnalysisContext'

export function AnalysisView() {
  const { sessionId } = useParams();

  if (!sessionId) {
    return <Navigate to="/" replace />;
  }

  return (
    <AnalysisProvider>
      <AnalysisViewContent sessionId={sessionId} />
    </AnalysisProvider>
  );
}

function AnalysisViewContent({ sessionId }: { sessionId: string }) {
  const {
    loading,
    lapIds,
    lapsData,
    analysisData,
    setLapIds,
    setLoading,
    setAnalysisData,
    setLapsData,
  } = useAnalysisContext();

  useSessionLoader({
    sessionId,
    lapIds,
    analysisData,
    setLoading,
    setAnalysisData,
    setLapIds
  });

  useTelemetryLoader({
    lapIds,
    lapsData,
    setLapsData,
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

  return (
    <AnalysisLayout />
  );
}
