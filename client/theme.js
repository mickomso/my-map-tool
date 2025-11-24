import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export const sidebarStyles = {
  collapsed: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
    padding: 1,
    borderRadius: 2,
  },
  expanded: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 300,
    maxHeight: 'calc(100vh - 40px)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 2,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
  },
};
