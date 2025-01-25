import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../App.css';

const Map = () => {
    const mapContainer = useRef(null); // Reference to the map container
    const mapInstance = useRef(null); // Reference to the Leaflet map instance
    const lastMarker = useRef(null); // To store the last marker and remove it when needed
    const [searchQuery, setSearchQuery] = useState(""); // State for managing search query

    useEffect(() => {
        if (mapContainer.current && !mapInstance.current) {
            console.log('Map container is ready');
            console.log('Initializing the map...');

            // Initialize map instance
            mapInstance.current = L.map(mapContainer.current, {
                center: [51.505, -0.09], // Set initial center
                zoom: 5, // Set initial zoom level
                scrollWheelZoom: true, // Allow scroll zoom
            });

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

    // Function to handle search and reposition map
    const handleSearch = async () => {
        if (!searchQuery) return;
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
        const data = await response.json();
        if (data.length > 0) {
            const { lat, lon } = data[0];

            // Adjust the map's center and zoom to the searched location (zooming only to the location)
            mapInstance.current.setView([lat, lon], 10); // Adjust map view to the search result
            L.marker([lat, lon]).addTo(mapInstance.current)
                .bindPopup(`Search Result: ${searchQuery}`)
                .openPopup();
        } else {
            alert('Location not found!');
        }
    };

    return (
        <div className="map-wrapper">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search for a location"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state
                />
                <button onClick={handleSearch}>Search</button>
            </div>
            <div
                ref={mapContainer} // Attach map to this container div
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100vh',
                    zIndex: '0' // Ensures the map takes up the full screen
                }}
            ></div>
        </div>
    );
};

export default Map;
