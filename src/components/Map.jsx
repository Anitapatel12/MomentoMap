import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../App.css';

const Map = () => {
    const mapContainer = useRef(null); // Reference to the map container
    const mapInstance = useRef(null); // Reference to the Leaflet map instance
    const lastMarker = useRef(null); // To store the last marker and remove it when needed

    useEffect(() => {
        if (mapContainer.current && !mapInstance.current) {
            console.log('Map container is ready');
            console.log('Initializing the map...');

            mapInstance.current = L.map(mapContainer.current).setView([51.505, -0.09], 5);

            L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapInstance.current);

            // Enable geolocation to show user's location
            mapInstance.current.locate({ setView: true, maxZoom: 16 });

            mapInstance.current.on('locationfound', (e) => {
                L.marker(e.latlng).addTo(mapInstance.current)
                    .bindPopup('You are here!')
                    .openPopup();
            });

            mapInstance.current.on('locationerror', () => {
                alert('Location access denied or not supported.');
            });

            // Click event listener to log clicked coordinates and add a marker
            mapInstance.current.on('click', async (e) => {
                const { lat, lng } = e.latlng;
                console.log(`Clicked at latitude: ${lat}, longitude: ${lng}`);

                // Fetch location name using a geocoding API (Nominatim)
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
                    const data = await response.json();

                    // Check if we received a valid location name
                    const locationName = data.display_name || 'No information available';

                    // If there's an existing marker, remove it
                    if (lastMarker.current) {
                        mapInstance.current.removeLayer(lastMarker.current);
                    }

                    // Add a new marker at the clicked location with the dynamic popup text
                    lastMarker.current = L.marker([lat, lng]).addTo(mapInstance.current)
                        .bindPopup(`Location: ${locationName}`)
                        .openPopup();

                } catch (error) {
                    console.error('Error fetching location:', error);
                    // In case of error, show a generic message
                    if (lastMarker.current) {
                        mapInstance.current.removeLayer(lastMarker.current);
                    }

                    lastMarker.current = L.marker([lat, lng]).addTo(mapInstance.current)
                        .bindPopup('Failed to retrieve location info.')
                        .openPopup();
                }
            });

            console.log('Map initialized successfully');
        }
    }, []);

    return (
        <div ref={mapContainer} className="map-container"></div>
    );
};

export default Map;
