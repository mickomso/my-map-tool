import React, { useState, useMemo, useEffect } from 'react';
import Map, { NavigationControl } from 'react-map-gl';
import { Meteor } from 'meteor/meteor';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, PathLayer } from '@deck.gl/layers';
import { Box, Paper, Typography, Chip } from '@mui/material';
import DirectionsBus from '@mui/icons-material/DirectionsBus';
import { useLayerStore } from '../stores/layerStore';
import { getCachedStops, getCachedShapes } from '../utils/gtfsCache';
import 'mapbox-gl/dist/mapbox-gl.css';

// Helper to call Meteor methods as promises
const callMethod = (method, ...args) =>
  new Promise((resolve, reject) => {
    Meteor.call(method, ...args, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });

const MapComponent = () => {
  const mapboxSettings = Meteor.settings.public?.mapbox || {};
  const visibleLayers = useLayerStore((state) => state.visibleLayers);
  const layerOrder = useLayerStore((state) => state.layerOrder);
  const dataVersion = useLayerStore((state) => state.dataVersion);

  const [viewState, setViewState] = useState({
    longitude: mapboxSettings.defaultCenter?.lng || -3.7038,
    latitude: mapboxSettings.defaultCenter?.lat || 40.4168,
    zoom: mapboxSettings.defaultZoom || 12,
  });

  const [stops, setStops] = useState([]);
  const [shapesData, setShapesData] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null);

  // Load data from IndexedDB cache or server
  useEffect(() => {
    async function loadData() {
      try {
        const [cachedStops, cachedShapes] = await Promise.all([
          getCachedStops(callMethod),
          getCachedShapes(callMethod),
        ]);
        setStops(cachedStops);
        setShapesData(cachedShapes);
      } catch (error) {
        console.error('Failed to load GTFS data:', error);
      }
    }
    loadData();
  }, [dataVersion]);

  // Create layer configurations (memoized to prevent recreation)
  const layerConfigs = useMemo(
    () => ({
      'GTFS Stops': () =>
        new ScatterplotLayer({
          id: 'gtfs-stops',
          data: stops,
          pickable: true,
          opacity: 0.8,
          stroked: true,
          filled: true,
          radiusScale: 3,
          radiusMinPixels: 2,
          radiusMaxPixels: 50,
          lineWidthMinPixels: 1,
          getPosition: (d) => [d.stop_lon, d.stop_lat],
          getRadius: 5,
          getFillColor: [255, 140, 0],
          getLineColor: [0, 0, 0],
          onHover: (info) => setHoverInfo(info.object ? { ...info, type: 'stop' } : null),
        }),
      'GTFS Routes': () =>
        new PathLayer({
          id: 'gtfs-routes',
          data: shapesData,
          pickable: true,
          widthScale: 5,
          widthMinPixels: 1,
          getPath: (d) => d.path,
          getColor: [0, 122, 255],
          getWidth: 1.25,
        }),
    }),
    [stops, shapesData]
  );

  // Create deck.gl layers in reverse order (top of sidebar renders on top of map)
  const layers = useMemo(
    () =>
      [...layerOrder]
        .reverse()
        .filter((layerName) => visibleLayers[layerName])
        .map((layerName) => layerConfigs[layerName]())
        .filter(Boolean),
    [layerOrder, visibleLayers, layerConfigs]
  );

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: newViewState }) => setViewState(newViewState)}
        controller={true}
        layers={layers}
      >
        <Map
          {...viewState}
          style={{ width: '100%', height: '100%' }}
          mapStyle={mapboxSettings.styleURL || 'mapbox://styles/mapbox/streets-v12'}
          mapboxAccessToken={mapboxSettings.accessToken}
        >
          <NavigationControl position='bottom-right' />
        </Map>
      </DeckGL>

      {/* Stop Tooltip */}
      {hoverInfo && hoverInfo.type === 'stop' && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            left: hoverInfo.x + 10,
            top: hoverInfo.y + 10,
            p: 1.5,
            pointerEvents: 'none',
            zIndex: 1000,
            width: 250,
          }}
        >
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant='subtitle2' fontWeight='bold'>
                {hoverInfo.object.agency_key}
              </Typography>
              <DirectionsBus color='primary' fontSize='small' />
            </Box>
            <Chip label='Stop' size='small' color='primary' />
          </Box>
          <Typography variant='body2' color='text.secondary'>
            <strong>Code:</strong> {hoverInfo.object.stop_code || 'N/A'}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            <strong>Name:</strong> {hoverInfo.object.stop_name}
          </Typography>
        </Paper>
      )}
    </div>
  );
};

export default MapComponent;
