import React, { useState } from 'react';
import Map, { NavigationControl } from 'react-map-gl';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { Stops } from '../../imports/api/gtfs';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapComponent = () => {
  const mapboxSettings = Meteor.settings.public?.mapbox || {};

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

  // Create deck.gl layers
  const layers = [
    new ScatterplotLayer({
      id: 'gtfs-stops',
      data: stops,
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 3,
      radiusMaxPixels: 100,
      lineWidthMinPixels: 1,
      getPosition: (d) => [d.stop_lon, d.stop_lat],
      getRadius: 10,
      getFillColor: [255, 140, 0],
      getLineColor: [0, 0, 0],
      onHover: ({ object }) => {
        if (object) {
          console.log('Stop:', object.stop_name);
        }
      },
    }),
  ];

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
