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
  components: {
    MuiPaper: {
      variants: [
        {
          props: { variant: 'sidebar-collapsed' },
          style: {
            borderRadius: 8,
            padding: 8,
            position: 'absolute',
            right: 20,
            top: 20,
            zIndex: 1000,
          },
        },
        {
          props: { variant: 'sidebar-expanded' },
          style: {
            borderRadius: 8,
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
        },
      ],
    },
    MuiListItemButton: {
      variants: [
        {
          props: { variant: 'nested' },
          style: {
            paddingLeft: 32,
          },
        },
      ],
    },
  },
});
