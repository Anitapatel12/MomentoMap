import React from 'react';
import Map from './components/Map';
import 'leaflet/dist/leaflet.css'; // Ensure this is at the top of your main entry file
// Make sure the path is correct

function App() {
  return (
    <div className="App">
      <Map /> {/* This should render the map */}
    </div>
  );
}

export default App;
