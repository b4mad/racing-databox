import './App.css'
import { Box, CssBaseline } from '@mui/material'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AnalysisView } from './views/AnalysisView'
import { SessionsView } from './views/SessionsView'
import { QueryParamProvider } from './providers/QueryParamProvider'
import { QueryProvider } from './providers/QueryProvider'
import { UIStateProvider } from './contexts/UIStateContext'
import { SessionProvider } from './contexts/SessionContext'
import { TelemetryProvider } from './contexts/TelemetryContext'

function AppContent() {
  const location = useLocation();
  const isSessionView = location.pathname.includes('/session/');

  return (
    <>
      <Box sx={{
        height: '100vh',
        width: '100vw',
        overflow: isSessionView ? 'hidden' : 'auto'
      }}>
        <Routes>
          <Route path="/session/:sessionId" element={<AnalysisView />} />
          <Route path="/sessions" element={<SessionsView />} />
          <Route path="/" element={<Navigate to="/sessions" replace />} />
        </Routes>
      </Box>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <QueryParamProvider>
          <ThemeProvider>
            <CssBaseline />
            <UIStateProvider>
            <SessionProvider>
              <TelemetryProvider>
                <AppContent />
              </TelemetryProvider>
            </SessionProvider>
            </UIStateProvider>
          </ThemeProvider>
        </QueryParamProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}

export default App
