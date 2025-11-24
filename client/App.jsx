import React from 'react';
import { version } from '../package.json';
import MapComponent from './components/Map';
import Sidebar from './components/Sidebar';

const App = () => {
  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1,
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '10px',
          borderRadius: '4px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.2rem' }}>My Boilerplate Meteor React</h1>
        <p style={{ margin: 0 }}>Version: {version}</p>
      </div>
      <Sidebar />
      <MapComponent />
    </div>
  );
};

export default App;
