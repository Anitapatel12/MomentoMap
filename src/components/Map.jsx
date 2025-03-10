import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../App.css';
import MemoryPopup from './MemoryPopup';

const Map = () => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [markers, setMarkers] = useState([]);
    const [routeLayer, setRouteLayer] = useState(null);
    const [distance, setDistance] = useState('');
    const [searchedLocations, setSearchedLocations] = useState([]);
    const [activeMarker, setActiveMarker] = useState(null);
    const [showMemoryPopup, setShowMemoryPopup] = useState(false);
    const [memories, setMemories] = useState([]);
    const [memoryCount, setMemoryCount] = useState(0);

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
                marker.on('click', () => handleMarkerClick(marker));

                setMarkers((prev) => [...prev, marker]);
                setSearchedLocations((prev) => [...prev, { lat, lon }]);
            } else {
                alert('Location not found.');
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const clearMap = () => {
        const isConfirmed = window.confirm('Are you sure you want to clear all markers? This will remove all the memories you have saved on the map.');

        if (isConfirmed) {
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
            setMemories([]);
            setMemoryCount(0);
            mapInstance.current.setView([51.505, -0.09], 5);
        }
    };

    const calculateRoute = async () => {
        if (searchedLocations.length < 2) {
            alert('Please search for at least two locations to calculate a route.');
            return;
        }

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

            marker.on('click', () => handleMarkerClick(marker));

            setMarkers((prev) => [...prev, marker]);
            setSearchedLocations((prev) => [...prev, { lat, lon: lng }]);
        });
    };

    const handleMarkerClick = (marker) => {
        const existingMemory = memories.find((mem) => mem.marker === marker);
        if (existingMemory) {

            setActiveMarker(marker);
            setShowMemoryPopup(true);
        } else {
            setActiveMarker(marker);
            setShowMemoryPopup(true);
        }
    };

    const closeMemoryPopup = () => {
        setShowMemoryPopup(false);
        setActiveMarker(null);
    };

    const saveMemory = (memory) => {
        let memoryNumber;
        if (!memory.number) {
            memoryNumber = memoryCount + 1;
            setMemoryCount((prev) => prev + 1);
        } else {
            memoryNumber = memory.number;
        }

        setMemories((prev) => [
            ...prev,
            { ...memory, number: memoryNumber }
        ]);

        setShowMemoryPopup(false);

        const photoUrl = memory.photos.length > 0 ? URL.createObjectURL(memory.photos[0]) : '';

        const memoryIcon = L.divIcon({
            className: 'custom-icon',
            html: `
                <div class="map-photo" style="background-image: url(${photoUrl});">
                    <div class="memory-number">${memoryNumber}</div> <!-- Always use memoryNumber -->
                </div>`,
        });

        memory.marker.setIcon(memoryIcon);

        if (memory.note) {
            memory.marker.bindPopup(`<b>${memory.note}</b>`).openPopup();
        }
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

            {showMemoryPopup && activeMarker && (
                <MemoryPopup
                    marker={activeMarker}
                    onClose={closeMemoryPopup}
                    onSaveMemory={saveMemory}
                    existingMemory={memories.find((mem) => mem.marker === activeMarker)}
                />
            )}
        </div>
    );
};

export default Map;
