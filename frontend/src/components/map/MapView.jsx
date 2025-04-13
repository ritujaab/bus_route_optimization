import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { fetchStopCoordinates } from '../../api';

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

function getRouteColor(routeName) {
  const routeNumber = parseInt(routeName.replace(/\D/g, ''));
  const colors = [
    '#4285F4', '#EA4335', '#FBBC05', '#34A853', '#9C27B0', '#673AB7',
    '#3F51B5', '#2196F3', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
    '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
  ];
  return colors[routeNumber % colors.length] || colors[0];
}

export default function MapView({ busRoutes }) {
  const [stops, setStops] = useState({});
  const [roadPaths, setRoadPaths] = useState({});

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

  useEffect(() => {
    const fetchAllRoadPaths = async () => {
      if (!busRoutes.length || !Object.keys(stops).length) return;
      const paths = {};

      for (const { busNumber, routePath } of busRoutes) {
        const coords = routePath.map(stop => stops[normalize(stop)]).filter(Boolean);
        paths[busNumber] = [];

        for (let i = 0; i < coords.length - 1; i++) {
          const segment = await fetchRoadPath(coords[i], coords[i + 1]);
          if (segment) {
            paths[busNumber].push(segment);
          }
        }
      }

      setRoadPaths(paths);
    };

    fetchAllRoadPaths();
  }, [busRoutes, stops]);

  return (
    <MapContainer center={[13.05, 80.25]} zoom={11} style={{ height: '100vh', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {busRoutes.map(({ busNumber, routePath }) => {
        const coords = routePath.map(stop => stops[normalize(stop)]).filter(Boolean);
        const color = getRouteColor(busNumber);

        if (roadPaths[busNumber]?.length > 0) {
          return roadPaths[busNumber].map((segment, segIdx) => (
            <Polyline
              key={`${busNumber}-seg-${segIdx}`}
              positions={segment}
              color={color}
              weight={4}
            />
          ));
        }

        return (
          <Polyline
            key={busNumber}
            positions={coords}
            color={color}
            weight={4}
          />
        );
      })}

      {/* ✅ Only show stops used in selected busRoutes */}
      {busRoutes.flatMap(({ busNumber, routePath }) =>
        routePath
          .map(stop => {
            const coords = stops[normalize(stop)];
            return coords
              ? { name: stop, coords, busNumber }
              : null;
          })
          .filter(Boolean)
      ).map(({ name, coords, busNumber }, index) => (
        <Marker key={`${busNumber}-${index}`} position={coords}>
          <Popup>
            <strong>{name}</strong><br />
            <span>Bus: {busNumber}</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
