import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0e14',
      paper: '#12161f',
    },
    primary: { main: '#7c5cff' },
    secondary: { main: '#00d4c8' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"SF Pro Text", -apple-system, "Segoe UI", sans-serif',
  },
});
