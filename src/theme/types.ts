import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    chart?: {
      text: string;
      grid: string;
    };
  }
  interface PaletteOptions {
    chart?: {
      text: string;
      grid: string;
    };
  }
}
