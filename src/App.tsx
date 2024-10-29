import './App.css'
import { Box } from '@mui/material'
import { Map } from './components/Map'

function App() {
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <Map />
    </Box>
  )
}

export default App
