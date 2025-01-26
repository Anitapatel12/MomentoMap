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
    const [routeInputs, setRouteInputs] = useState({ start: '', end: '' });
    const [routePopupVisible, setRoutePopupVisible] = useState(false);
    const [distance, setDistance] = useState('');

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
            } else {
                alert('Location not found.');
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const calculateRoute = async () => {
        const { start, end } = routeInputs;
        if (!start || !end) {
            alert('Please provide both start and end locations.');
            return;
        }

        try {
            const startResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${start}`
            );
            const startData = await startResponse.json();
            if (startData.length === 0) {
                alert('Start location not found.');
                return;
            }

            const startCoords = {
                lat: parseFloat(startData[0].lat),
                lon: parseFloat(startData[0].lon),
            };

            const endResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${end}`
            );
            const endData = await endResponse.json();
            if (endData.length === 0) {
                alert('End location not found.');
                return;
            }

            const endCoords = {
                lat: parseFloat(endData[0].lat),
                lon: parseFloat(endData[0].lon),
            };

            // Add markers for both start and end locations
            const startMarker = L.marker([startCoords.lat, startCoords.lon], { draggable: true })
                .addTo(mapInstance.current)
                .bindPopup(`Start: ${start}`)
                .openPopup();

            const endMarker = L.marker([endCoords.lat, endCoords.lon], { draggable: true })
                .addTo(mapInstance.current)
                .bindPopup(`End: ${end}`)
                .openPopup();

            setMarkers((prev) => [
                ...prev,
                startMarker,
                endMarker
            ]);

            // Fetch route
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/car/${startCoords.lon},${startCoords.lat};${endCoords.lon},${endCoords.lat}?overview=full&geometries=geojson`
            );
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = L.geoJSON(data.routes[0].geometry);
                if (routeLayer) {
                    mapInstance.current.removeLayer(routeLayer);
                }
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
            L.marker(e.latlng)
                .addTo(mapInstance.current)
                .bindPopup('You are here!')
                .openPopup();
        });
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
        setRouteInputs({ start: '', end: '' });
        setMarkers([]);
        mapInstance.current.setView([51.505, -0.09], 5); // Reset map view
    };

    const openRoutePopup = () => {
        setRoutePopupVisible(true);
    };

    const closeRoutePopup = () => {
        setRoutePopupVisible(false);
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
                    <button onClick={openRoutePopup}>Get Route</button>
                </div>

                {routePopupVisible && (
                    <div className="route-popup">
                        <h3>Enter Start and End Locations for Route:</h3>
                        <input
                            type="text"
                            placeholder="Start location"
                            value={routeInputs.start}
                            onChange={(e) => setRouteInputs({ ...routeInputs, start: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="End location"
                            value={routeInputs.end}
                            onChange={(e) => setRouteInputs({ ...routeInputs, end: e.target.value })}
                        />
                        <button onClick={calculateRoute}>Submit</button>
                        <button onClick={closeRoutePopup}>Cancel</button>
                    </div>
                )}

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
