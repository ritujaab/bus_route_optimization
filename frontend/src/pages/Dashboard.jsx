import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/layout/Header';
import Sidebar from '../components/sidebar/Sidebar';
import MapView from '../components/map/MapView';
import { busRoutePaths as defaultBusRoutePaths } from '../data/extracted_data';

function Dashboard() {
  const [scheduleType, setScheduleType] = useState('normal');
  const [selectedBuses, setSelectedBuses] = useState([]);
  const [filters, setFilters] = useState({
    ssnYears: { year1: false, year2: false, year3: false, year4: false },
    snuYears: { year1: false, year2: false, year3: false, year4: false },
    ssnFaculty: false,
    snuFaculty: false,
    maxCapacity: 60,
    distanceThreshold: 3,
    demandIgnoreThreshold: 1,
    maxDemandSumForFarStops: 2
  });
  

  const [routeData, setRouteData] = useState([]);

  const isFilterApplied = () => {
    return (
      filters.ssnFaculty || filters.snuFaculty ||
      Object.values(filters.ssnYears).includes(true) ||
      Object.values(filters.snuYears).includes(true)
    );
  };

  const fetchRoutes = async () => {
    if (isFilterApplied()) {
      try {
        const response = await axios.get("http://localhost:5000/api/get_routes");
        const formatted = Object.entries(response.data).map(([busNumber, path]) => ({
          busNumber,
          routePath: path,
        }));
        console.log("Fetched route data:", formatted);
        setRouteData(formatted);
      } catch (error) {
        console.error("Error fetching merged route data:", error);
        setRouteData([]);
      }
    } else {
      const fallback = defaultBusRoutePaths.map(route => ({
        busNumber: route.busNumber,
        routePath: route.path,
      }));
      setRouteData(fallback);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [filters]);

  const getFilteredBuses = () => {
    if (selectedBuses.length === 0) return routeData;
    return routeData.filter(bus => selectedBuses.includes(bus.busNumber));
  };

  const handleBusSelection = (busNumber) => {
    setSelectedBuses(prev =>
      prev.includes(busNumber)
        ? prev.filter(b => b !== busNumber)
        : [...prev, busNumber]
    );
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleScheduleTypeChange = (type) => {
    setScheduleType(type);
  };

  const clearFilters = () => {
    const defaultFilters = {
      ssnYears: { year1: false, year2: false, year3: false, year4: false },
      snuYears: { year1: false, year2: false, year3: false, year4: false },
      ssnFaculty: false,
      snuFaculty: false,
      maxCapacity: 60,
      distanceThreshold: 3,
      demandIgnoreThreshold: 1,
      maxDemandSumForFarStops: 2
    };    
    setFilters(defaultFilters);
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
          onClearFilters={clearFilters}
          buses={routeData}
          selectedBuses={selectedBuses}
          onBusSelect={handleBusSelection}
        />

        {console.log("Filtered Buses:", getFilteredBuses())}
        {/*
        <div className="flex-1 overflow-auto p-6">
          <MapView
            busRoutes={getFilteredBuses()}
          />
        </div>
        */}
      </div>
    </div>
  );
}

export default Dashboard;
