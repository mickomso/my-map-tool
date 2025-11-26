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
  Box,
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import MenuOpen from '@mui/icons-material/MenuOpen';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import DirectionsBus from '@mui/icons-material/DirectionsBus';
import { useLayerStore } from '../stores/layerStore';
import GTFSLoader from './GTFSLoader';

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [openLayers, setOpenLayers] = useState({});
  const [gtfsOpen, setGtfsOpen] = useState(false);

  const visibleLayers = useLayerStore((state) => state.visibleLayers);
  const toggleVisibility = useLayerStore((state) => state.toggleVisibility);

  const handleToggleLayer = (layerName) => {
    setOpenLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  const layers = [
    {
      name: 'GTFS',
      sublayers: ['GTFS Stops'],
    },
  ];

  // Check if parent layer should be visible (any sublayer is visible)
  const isParentVisible = (layer) => {
    return layer.sublayers.some((sub) => visibleLayers[sub]);
  };

  const handleToggleVisibility = (layerName, e) => {
    e.stopPropagation();
    const parentLayer = layers.find((l) => l.name === layerName);
    toggleVisibility(layerName, parentLayer ? parentLayer.sublayers : []);
  };

  if (!open) {
    return (
      <Paper elevation={3} variant='sidebar-collapsed'>
        <IconButton onClick={() => setOpen(true)} color='primary'>
          <MenuOpen />
        </IconButton>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} variant='sidebar-expanded'>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          p: 2,
        }}
      >
        <Typography color='primary' variant='h6'>
          Layers
        </Typography>
        <Box>
          <IconButton onClick={() => setGtfsOpen(true)} color='primary' size='small' sx={{ mr: 1 }}>
            <DirectionsBus />
          </IconButton>
          <IconButton onClick={() => setOpen(false)} color='primary' size='small'>
            <Close />
          </IconButton>
        </Box>
      </Box>
      <Divider />
      <List sx={{ overflowY: 'auto' }}>
        {layers.map((layer) => (
          <Box key={layer.name}>
            <ListItemButton onClick={() => handleToggleLayer(layer.name)}>
              <IconButton
                size='small'
                onClick={(e) => handleToggleVisibility(layer.name, e)}
                sx={{ mr: 1 }}
              >
                {isParentVisible(layer) ? <Visibility /> : <VisibilityOff />}
              </IconButton>
              <ListItemText primary={layer.name} />
              {openLayers[layer.name] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openLayers[layer.name]} timeout='auto' unmountOnExit>
              <List component='div' disablePadding>
                {layer.sublayers.map((sublayer) => (
                  <ListItemButton
                    key={sublayer}
                    variant='nested'
                    onClick={(e) => handleToggleVisibility(sublayer, e)}
                  >
                    <IconButton size='small' sx={{ mr: 1 }}>
                      {visibleLayers[sublayer] ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                    <ListItemText
                      primary={sublayer}
                      slotProps={{
                        primary: {
                          variant: 'body2',
                          color: visibleLayers[sublayer] ? 'text.primary' : 'text.disabled',
                        },
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}
      </List>
      <GTFSLoader open={gtfsOpen} onClose={() => setGtfsOpen(false)} />
    </Paper>
  );
};

export default Sidebar;
