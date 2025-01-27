import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../App.css';

const Map = () => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [markers, setMarkers] = useState([]);
    const [routeLayer, setRouteLayer] = useState(null);
    const [distance, setDistance] = useState('');
    const [searchedLocations, setSearchedLocations] = useState([]);

    useEffect(() => {
        if (mapContainer.current && !mapInstance.current) {
            mapInstance.current = L.map(mapContainer.current, {
                center: [51.505, -0.09],
                zoom: 5,
                scrollWheelZoom: true,
            });

            L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapInstance.current);
        }
    }, []);

    const handleSearch = async () => {
        if (!searchQuery) return;
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`
            );
            const data = await response.json();
            if (data.length > 0) {
                const { lat, lon } = data[0];
                mapInstance.current.setView([lat, lon], 10);

                const marker = L.marker([lat, lon], { draggable: true }).addTo(mapInstance.current);
                marker.bindPopup(`Search Result: ${searchQuery}`).openPopup();

                setMarkers((prev) => [...prev, marker]);
                setSearchedLocations((prev) => [...prev, { lat, lon }]); // Track searched locations
            } else {
                alert('Location not found.');
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const clearMap = () => {
        markers.forEach((marker) => {
            mapInstance.current.removeLayer(marker);
        });

        if (routeLayer) {
            mapInstance.current.removeLayer(routeLayer);
            setRouteLayer(null);
        }

        setDistance('');
        setSearchedLocations([]);
        setMarkers([]);
        mapInstance.current.setView([51.505, -0.09], 5); // Reset map view
    };

    const calculateRoute = async () => {
        if (searchedLocations.length < 2) {
            alert('Please search for at least two locations to calculate a route.');
            return;
        }

        // Get the last two searched locations
        const start = searchedLocations[searchedLocations.length - 2];
        const end = searchedLocations[searchedLocations.length - 1];

        if (routeLayer) {
            mapInstance.current.removeLayer(routeLayer);
        }

        try {
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/car/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`
            );
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = L.geoJSON(data.routes[0].geometry);
                setRouteLayer(route);
                route.addTo(mapInstance.current);

                setDistance((data.routes[0].distance / 1000).toFixed(2) + ' km');
            } else {
                alert('No route found.');
            }
        } catch (error) {
            console.error('Error fetching route:', error);
            alert('Error fetching route.');
        }
    };

    const handleGeolocation = () => {
        mapInstance.current.locate({ setView: true, maxZoom: 16 });
        mapInstance.current.on('locationfound', (e) => {
            const { lat, lng } = e.latlng;

            const marker = L.marker([lat, lng], { draggable: true }).addTo(mapInstance.current);

            marker.bindPopup('You are here!').openPopup();
            setMarkers((prev) => [...prev, marker]);
            setSearchedLocations((prev) => [...prev, { lat, lon: lng }]);
        });
    };

    return (
        <div className="map-wrapper">
            <div className="controls">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search for a location"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button onClick={handleSearch}>Search</button>
                    <button onClick={handleGeolocation}>Show My Location</button>
                    <button onClick={clearMap}>Clear All</button>
                    <button onClick={calculateRoute}>Get Route</button>
                </div>

                {distance && (
                    <div className="distance-display">
                        <p>Estimated Distance: {distance}</p>
                    </div>
                )}
            </div>

            <div
                ref={mapContainer}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100vh',
                    zIndex: 1,
                }}
            ></div>
        </div>
    );
};

export default Map;
