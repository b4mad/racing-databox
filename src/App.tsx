import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SessionView } from './views/SessionView'
import { SessionsView } from './views/SessionsView'
import { QueryParamProvider } from './providers/QueryParamProvider'
import { QueryProvider } from './providers/QueryProvider'
import { UIStateProvider } from './contexts/UIStateContext'
import { SessionProvider } from './contexts/SessionContext'
import { TelemetryProvider } from './contexts/TelemetryContext'

function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <QueryParamProvider>
          <UIStateProvider>
            <SessionProvider>
              <TelemetryProvider>
            <Routes>
              <Route path="/session/:sessionId" element={<SessionView />} />
              <Route path="/sessions" element={<SessionsView />} />
              <Route path="/" element={<Navigate to="/sessions" replace />} />
            </Routes>
              </TelemetryProvider>
            </SessionProvider>
          </UIStateProvider>
        </QueryParamProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}

export default App
