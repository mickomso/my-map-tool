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
import Close from '@mui/icons-material/Close';
import MenuOpen from '@mui/icons-material/MenuOpen';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useLayerStore } from '../stores/layerStore';
import { sidebarStyles } from '../theme';

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [openLayers, setOpenLayers] = useState({});

  const visibleLayers = useLayerStore((state) => state.visibleLayers);
  const toggleVisibility = useLayerStore((state) => state.toggleVisibility);

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
    toggleVisibility(layerName, parentLayer ? parentLayer.sublayers : []);
  };

  if (!open) {
    return (
      <Paper elevation={3} sx={sidebarStyles.collapsed}>
        <IconButton onClick={() => setOpen(true)} color='primary'>
          <MenuOpen />
        </IconButton>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={sidebarStyles.expanded}>
      <div style={sidebarStyles.header}>
        <Typography variant='h6'>Layers</Typography>
        <IconButton onClick={() => setOpen(false)} size='small'>
          <Close />
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
                    <ListItemText
                      primary={sublayer}
                      slotProps={{ primary: { variant: 'body2' } }}
                    />
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
