import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SessionView } from './views/SessionView'
import { SessionsView } from './views/SessionsView'
import { QueryParamProvider } from './providers/QueryParamProvider'
import { SessionProvider } from './contexts/SessionContext'
import { TelemetryProvider } from './contexts/TelemetryContext'

function App() {
  return (
    <BrowserRouter>
      <QueryParamProvider>
        <TelemetryProvider>
          <SessionProvider>
            <Routes>
          <Route path="/session/:sessionId" element={<SessionView />} />
          <Route path="/sessions" element={<SessionsView />} />
          {/* <Route path="/" element={<Navigate to="/session/1729092115" replace />} /> */}
          <Route path="/" element={<Navigate to="/sessions" replace />} />
            </Routes>
          </SessionProvider>
        </TelemetryProvider>
      </QueryParamProvider>
    </BrowserRouter>
  );
}

export default App
