import React, { useState } from 'react';
import Map, { NavigationControl } from 'react-map-gl';
import { Meteor } from 'meteor/meteor';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapComponent = () => {
  const mapboxSettings = Meteor.settings.public?.mapbox || {};

  const [viewState, setViewState] = useState({
    longitude: mapboxSettings.defaultCenter?.lng || -3.7038,
    latitude: mapboxSettings.defaultCenter?.lat || 40.4168,
    zoom: mapboxSettings.defaultZoom || 12,
  });

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapboxSettings.styleURL || 'mapbox://styles/mapbox/streets-v12'}
        mapboxAccessToken={mapboxSettings.accessToken}
      >
        <NavigationControl position='bottom-right' />
      </Map>
    </div>
  );
};

export default MapComponent;
