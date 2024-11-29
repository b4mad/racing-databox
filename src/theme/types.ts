import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    chart?: {
      text: string;
      grid: string;
      labelBackground: string;
      labelText: string;
      segment: string;
      toggleButton: {
        color: string;
        selectedColor: string;
        background: string;
        hoverBackground: string;
      };
    };
  }
  interface PaletteOptions {
    chart?: {
      text: string;
      grid: string;
      labelBackground: string;
      labelText: string;
      segment: string;
      toggleButton: {
        color: string;
        selectedColor: string;
        background: string;
        hoverBackground: string;
      };
    };
  }
}
