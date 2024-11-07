import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SessionView } from './views/SessionView'
import { QueryParamProvider } from './providers/QueryParamProvider'

function App() {
  return (
    <BrowserRouter>
      <QueryParamProvider>
        <Routes>
          <Route path="/session/:sessionId" element={<SessionView />} />
          <Route path="/" element={<Navigate to="/session/1729092115" replace />} />
        </Routes>
      </QueryParamProvider>
    </BrowserRouter>
  );
}

export default App
