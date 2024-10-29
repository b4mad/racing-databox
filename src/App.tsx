import './App.css'
import { Grid } from '@mui/material'
import { Map } from './components/Map'

function App() {
  return (
    <Grid
      container
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <Grid item xs={12} sx={{ height: '100%' }}>
        <Map />
      </Grid>
    </Grid>
  )
}

export default App
