import { createTheme, PaletteMode } from '@mui/material';

export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light' 
      ? {
          // Light mode colors
          primary: {
            main: '#1976d2',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          chart: {
            text: '#000000',
            grid: '#e0e0e0',
          },
        }
      : {
          // Dark mode colors
          primary: {
            main: '#90caf9',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          chart: {
            text: '#ffffff',
            grid: '#424242',
          },
        }),
  },
});
