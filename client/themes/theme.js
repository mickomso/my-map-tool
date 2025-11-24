import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    background: {
      default: '#f5f5f5',
    },
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export const sidebarStyles = {
  collapsed: {
    borderRadius: 2,
    padding: 1,
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1000,
  },
  expanded: {
    borderRadius: 2,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 40px)',
    overflow: 'hidden',
    position: 'absolute',
    right: 20,
    top: 20,
    width: 300,
    zIndex: 1000,
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px',
  },
  nestedListItem: {
    pl: 4,
  },
};
