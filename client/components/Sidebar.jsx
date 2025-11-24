import React from 'react';
import {
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';

const Sidebar = () => {
  const [open, setOpen] = React.useState(true);

  if (!open) {
    return (
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 1000,
          padding: 1,
          borderRadius: 2,
        }}
      >
        <IconButton onClick={() => setOpen(true)} color='primary'>
          <MenuIcon />
        </IconButton>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
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
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
        }}
      >
        <Typography variant='h6'>Layers</Typography>
        <IconButton onClick={() => setOpen(false)} size='small'>
          <CloseIcon />
        </IconButton>
      </div>
      <Divider />
      <List sx={{ overflowY: 'auto' }}>
        <ListItem button>
          <ListItemText primary='Layer 1' secondary='Visible' />
        </ListItem>
        <ListItem button>
          <ListItemText primary='Layer 2' secondary='Hidden' />
        </ListItem>
        <ListItem button>
          <ListItemText primary='Traffic' secondary='Enabled' />
        </ListItem>
      </List>
    </Paper>
  );
};

export default Sidebar;
