import React, { useState } from 'react';
import Map, { NavigationControl } from 'react-map-gl';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, PathLayer } from '@deck.gl/layers';
import { Stops, Shapes } from '../../imports/api/gtfs';
import { useLayerStore } from '../stores/layerStore';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapComponent = () => {
  const mapboxSettings = Meteor.settings.public?.mapbox || {};
  const visibleLayers = useLayerStore((state) => state.visibleLayers);

  const [viewState, setViewState] = useState({
    longitude: mapboxSettings.defaultCenter?.lng || -3.7038,
    latitude: mapboxSettings.defaultCenter?.lat || 40.4168,
    zoom: mapboxSettings.defaultZoom || 12,
  });

  // Subscribe to stops data
  const stops = useTracker(() => {
    Meteor.subscribe('gtfs.stops');
    return Stops.find({}).fetch();
  }, []);

  // Subscribe to shapes data and convert to paths
  const shapesData = useTracker(() => {
    Meteor.subscribe('gtfs.shapes');
    const shapes = Shapes.find({}).fetch();

    console.log('Shapes count:', shapes.length);
    if (shapes.length > 0) {
      console.log('Sample shape:', shapes[0]);
    }

    // Group shapes by shape_id
    const shapesMap = shapes.reduce((acc, shape) => {
      if (!acc[shape.shape_id]) {
        acc[shape.shape_id] = [];
      }
      acc[shape.shape_id].push(shape);
      return acc;
    }, {});

    // Sort shapes by sequence and create path data
    return Object.keys(shapesMap).map((shapeId) => {
      const shapePoints = shapesMap[shapeId].sort(
        (a, b) => a.shape_pt_sequence - b.shape_pt_sequence
      );
      return {
        shape_id: shapeId,
        path: shapePoints.map((s) => [s.shape_pt_lon, s.shape_pt_lat]),
      };
    });
  }, []);

  // Create deck.gl layers
  const layers = [
    visibleLayers['GTFS Stops'] &&
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
        onHover: ({ object }) => {
          if (object) {
            console.log('Stop:', object.stop_name);
          }
        },
      }),
    visibleLayers['GTFS Routes'] &&
      new PathLayer({
        id: 'gtfs-routes',
        data: shapesData,
        pickable: true,
        widthScale: 5,
        widthMinPixels: 1,
        getPath: (d) => d.path,
        getColor: [0, 122, 255], // Blue color for routes
        getWidth: 1.25,
        onHover: ({ object }) => {
          if (object) {
            console.log('Shape ID:', object.shape_id);
          }
        },
      }),
  ].filter(Boolean);
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
    </div>
  );
};

export default MapComponent;
