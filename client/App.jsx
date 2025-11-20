import React from 'react';
import { version } from '../package.json';

const App = () => {
  return (
    <div>
      <h1>My Boilerplate Meteor React</h1>
      <p>Version: {version}</p>
    </div>
  );
};

export default App;
