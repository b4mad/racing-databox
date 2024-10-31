import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SessionView } from './views/SessionView'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/session/:sessionId/:lapNumber" element={<SessionView />} />
        <Route path="/session/:sessionId" element={<SessionView />} />
        <Route path="/" element={<Navigate to="/session/1729092115" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
