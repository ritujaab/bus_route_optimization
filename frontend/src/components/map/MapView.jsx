import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { fetchStopCoordinates } from '../../api.js';

const normalize = str => str.toLowerCase().trim();

async function fetchRoadPath(startPoint, endPoint) {
  const url = `https://router.project-osrm.org/route/v1/driving/${startPoint[1]},${startPoint[0]};${endPoint[1]},${endPoint[0]}?overview=full&geometries=geojson`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch road path:", err);
    return null;
  }
}

// Function to generate a color based on route name
function getRouteColor(routeName) {
  // Extract the route number if possible
  const routeNumber = parseInt(routeName.replace(/\D/g, ''));
  
  // List of distinct colors for routes
  const colors = [
    '#4285F4', // Blue
    '#EA4335', // Red
    '#FBBC05', // Yellow
    '#34A853', // Green
    '#9C27B0', // Purple
    '#673AB7', // Deep Purple
    '#3F51B5', // Indigo
    '#2196F3', // Light Blue
    '#009688', // Teal
    '#4CAF50', // Light Green
    '#8BC34A', // Lime
    '#CDDC39', // Yellow-Green
    '#FFEB3B', // Yellow
    '#FFC107', // Amber
    '#FF9800', // Orange
    '#FF5722'  // Deep Orange
  ];
  
  return colors[routeNumber % colors.length] || colors[0];
}

export default function MapView() {
  const [routes, setRoutes] = useState({});
  const [stops, setStops] = useState({});
  const [roadPaths, setRoadPaths] = useState({});
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [stopToRouteMap, setStopToRouteMap] = useState({});

  // Fetch all route files
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/all_routes");
        const data = await res.json();
        setRoutes(data);
        setSelectedRoutes(Object.keys(data)); // Select all initially
        
        // Create a mapping of stops to routes they belong to
        const stopMapping = {};
        Object.entries(data).forEach(([routeName, stops]) => {
          stops.forEach(stop => {
            const normStop = normalize(stop);
            if (!stopMapping[normStop]) {
              stopMapping[normStop] = [];
            }
            stopMapping[normStop].push(routeName);
          });
        });
        setStopToRouteMap(stopMapping);
      } catch (err) {
        console.error("Failed to load route data:", err);
      }
    };

    fetchRoutes();
  }, []);

  // Fetch stop coordinates
  useEffect(() => {
    const loadStops = async () => {
      try {
        const stopData = await fetchStopCoordinates();
        setStops(stopData);
      } catch (err) {
        console.error("❌ Error loading stops:", err);
      }
    };

    loadStops();
  }, []);

  // Fetch road paths for selected routes
  useEffect(() => {
    const fetchAllRoadPaths = async () => {
      if (!selectedRoutes.length || !Object.keys(stops).length) return;
      const paths = {};

      for (const routeName of selectedRoutes) {
        if (!routes[routeName]) continue; // Guard
        const stopList = routes[routeName];
        const coords = stopList
          .map(stop => stops[normalize(stop)])
          .filter(Boolean);

        paths[routeName] = [];
        for (let i = 0; i < coords.length - 1; i++) {
          const pathSegment = await fetchRoadPath(coords[i], coords[i + 1]);
          if (pathSegment) {
            paths[routeName].push(pathSegment);
          }
        }
      }

      setRoadPaths(paths);
    };

    fetchAllRoadPaths();
  }, [selectedRoutes, stops, routes]);

  const allRouteNames = Object.keys(routes);

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '300px', background: '#111', color: '#fff', padding: '1rem', overflowY: 'auto' }}>
        <h2>Available Routes</h2>
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => setSelectedRoutes(allRouteNames)}
            style={{ marginRight: '10px', background: '#333', color: 'white', padding: '0.5rem', borderRadius: '4px' }}
          >
            Select All
          </button>
          <button
            onClick={() => setSelectedRoutes([])}
            style={{ background: '#555', color: 'white', padding: '0.5rem', borderRadius: '4px' }}
          >
            Deselect All
          </button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {allRouteNames.map(route => {
            const color = getRouteColor(route);
            return (
              <li key={route} style={{ marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedRoutes.includes(route)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedRoutes(prev => [...prev, route]);
                      } else {
                        setSelectedRoutes(prev => prev.filter(r => r !== route));
                      }
                    }}
                  />
                  <span 
                    style={{ 
                      display: 'inline-block', 
                      width: '15px', 
                      height: '15px', 
                      backgroundColor: color, 
                      marginLeft: '8px',
                      marginRight: '8px',
                      borderRadius: '50%'
                    }} 
                  />
                  <span>{route}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div style={{ flexGrow: 1 }}>
        <MapContainer center={[13.05, 80.25]} zoom={11} style={{ height: '100vh', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {selectedRoutes.map(routeName => {
            const stopList = routes[routeName];
            const coords = stopList
              .map(stop => stops[normalize(stop)])
              .filter(Boolean);
            
            const routeColor = getRouteColor(routeName);

            if (roadPaths[routeName] && roadPaths[routeName].length > 0) {
              return roadPaths[routeName].map((segment, segIdx) => (
                <Polyline 
                  key={`${routeName}-seg-${segIdx}`} 
                  positions={segment} 
                  color={routeColor}
                  weight={4} 
                />
              ));
            }

            return (
              <Polyline 
                key={routeName} 
                positions={coords} 
                color={routeColor}
                weight={4}
              />
            );
          })}

          {/* Render markers for all stops of selected routes */}
          {Object.entries(stops).map(([stopKey, coords]) => {
            // Find what routes this stop belongs to
            const routesForStop = stopToRouteMap[stopKey] || [];
            
            // Only show stops that are part of selected routes
            const relevantRoutes = routesForStop.filter(r => selectedRoutes.includes(r));
            if (relevantRoutes.length === 0) return null;
            
            // Find the original stop name (non-normalized)
            let originalStopName = stopKey;
            for (const routeName of relevantRoutes) {
              const routeStops = routes[routeName] || [];
              const matchingStop = routeStops.find(s => normalize(s) === stopKey);
              if (matchingStop) {
                originalStopName = matchingStop;
                break;
              }
            }
            
            return (
              <Marker key={`marker-${stopKey}`} position={coords}>
                <Popup>
                  <strong>{originalStopName}</strong>
                  <div style={{ marginTop: '5px' }}>
                    <strong>Routes: </strong>
                    {relevantRoutes.map((route, idx) => (
                      <span key={route}>
                        {route}
                        {idx < relevantRoutes.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}