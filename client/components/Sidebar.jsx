import React, { useState } from 'react';
import {
  Paper,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Collapse,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [openLayers, setOpenLayers] = useState({});
  const [visibleLayers, setVisibleLayers] = useState({
    'Layer 1': true,
    'Layer 2': false,
    Traffic: true,
    'Sublayer 1.1': true,
    'Sublayer 1.2': true,
    'Sublayer 2.1': true,
    'Sublayer 2.2': true,
    'Sublayer 2.3': true,
    Congestion: true,
    Incidents: true,
  });

  const handleToggleLayer = (layerName) => {
    setOpenLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  const layers = [
    {
      name: 'Layer 1',
      status: 'Visible',
      sublayers: ['Sublayer 1.1', 'Sublayer 1.2'],
    },
    {
      name: 'Layer 2',
      status: 'Hidden',
      sublayers: ['Sublayer 2.1', 'Sublayer 2.2', 'Sublayer 2.3'],
    },
    {
      name: 'Traffic',
      status: 'Enabled',
      sublayers: ['Congestion', 'Incidents'],
    },
  ];

  const handleToggleVisibility = (layerName, e) => {
    e.stopPropagation();

    const parentLayer = layers.find((l) => l.name === layerName);

    if (parentLayer) {
      const newVisibility = !visibleLayers[layerName];
      const newLayerState = { ...visibleLayers, [layerName]: newVisibility };

      // If parent is toggled, toggle all sublayers to match
      parentLayer.sublayers.forEach((sub) => {
        newLayerState[sub] = newVisibility;
      });

      setVisibleLayers(newLayerState);
    } else {
      setVisibleLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
    }
  };

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
        {layers.map((layer) => (
          <React.Fragment key={layer.name}>
            <ListItemButton onClick={() => handleToggleLayer(layer.name)}>
              <IconButton
                size='small'
                onClick={(e) => handleToggleVisibility(layer.name, e)}
                sx={{ mr: 1 }}
              >
                {visibleLayers[layer.name] ? <Visibility /> : <VisibilityOff />}
              </IconButton>
              <ListItemText
                primary={layer.name}
                secondary={visibleLayers[layer.name] ? 'Visible' : 'Hidden'}
              />
              {openLayers[layer.name] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openLayers[layer.name]} timeout='auto' unmountOnExit>
              <List component='div' disablePadding>
                {layer.sublayers.map((sublayer) => (
                  <ListItemButton key={sublayer} sx={{ pl: 4 }}>
                    <IconButton
                      size='small'
                      onClick={(e) => handleToggleVisibility(sublayer, e)}
                      sx={{ mr: 1 }}
                    >
                      {visibleLayers[sublayer] ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                    <ListItemText primary={sublayer} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default Sidebar;
