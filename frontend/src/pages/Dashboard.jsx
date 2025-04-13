// src/pages/Dashboard.jsx
import { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/sidebar/Sidebar';
import MapView from '../components/map/MapView';
import { busRoutePaths } from '../data/extracted_data';

function Dashboard() {
  const [scheduleType, setScheduleType] = useState('normal');
  const [selectedBuses, setSelectedBuses] = useState([]);
  const [filters, setFilters] = useState({
    university: 'all',
    ssnYears: {
      year1: false,
      year2: false,
      year3: false,
      year4: false,
    },
    snuYears: {
      year1: false,
      year2: false,
      year3: false,
      year4: false,
    },
    ssnFaculty: false,
    snuFaculty: false,
  });

  // Get all buses from the route paths
  const allBuses = [...new Set(busRoutePaths.map(route => route.busNumber))].map(busNumber => ({ busNumber }));

  // Get filtered buses
  const getFilteredBuses = () => {
    if (selectedBuses.length === 0) {
      return allBuses;
    }
    return allBuses.filter(bus => selectedBuses.includes(bus.busNumber));
  };

  // Get route paths for selected buses
  const getSelectedRoutePaths = () => {
    if (selectedBuses.length === 0) {
      return busRoutePaths;
    }
    return busRoutePaths.filter(route => selectedBuses.includes(route.busNumber));
  };

  const handleBusSelection = (busNumber) => {
    setSelectedBuses(prev => {
      if (prev.includes(busNumber)) {
        return prev.filter(b => b !== busNumber);
      } else {
        return [...prev, busNumber];
      }
    });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleScheduleTypeChange = (type) => {
    setScheduleType(type);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          scheduleType={scheduleType}
          onScheduleTypeChange={handleScheduleTypeChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          buses={allBuses}
          selectedBuses={selectedBuses}
          onBusSelect={handleBusSelection}
        />
        
        <div className="flex-1 overflow-auto p-6">
          <MapView 
            busRoutes={getFilteredBuses()}
            routePaths={getSelectedRoutePaths()}
            scheduleType={scheduleType}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
