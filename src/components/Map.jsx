import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Required to load Leaflet styles
import '../App.css'; // Your custom map styles, if needed

const Map = () => {
    const mapContainer = useRef(null); // Reference to the map container
    const mapInstance = useRef(null); // Reference to the Leaflet map instance

    useEffect(() => {
        // Check if the container is available and the map isn't already initialized
        if (mapContainer.current && !mapInstance.current) {
            console.log('Map container is ready');
            console.log('Initializing the map...');

            // Initialize the map only if it's not initialized already
            mapInstance.current = L.map(mapContainer.current).setView([51.505, -0.09], 5); // Initial center and zoom level

            // Add OpenStreetMap tile layer
            L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapInstance.current);

            console.log('Map initialized successfully');
        }
    }, []);

    return (
        <div
            ref={mapContainer} // Attach map to this container div
            className="map-container" // ClassName for styling
        ></div>
    );
};

export default Map;
