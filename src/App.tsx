import './App.css'
import { Box, CssBaseline } from '@mui/material'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { NavigationBar } from './components/NavigationBar'
import { SessionView } from './views/SessionView'
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
      {isSessionView && <NavigationBar />}
      <Box sx={{ 
        height: '100vh',
        width: '100vw',
        overflow: isSessionView ? 'hidden' : 'auto'
      }}>
        <Routes>
          <Route path="/session/:sessionId" element={<SessionView />} />
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
      <ThemeProvider>
        <CssBaseline />
        <QueryProvider>
        <QueryParamProvider>
          <UIStateProvider>
            <SessionProvider>
              <TelemetryProvider>
                <AppContent />
              </TelemetryProvider>
            </SessionProvider>
          </UIStateProvider>
        </QueryParamProvider>
      </QueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App
