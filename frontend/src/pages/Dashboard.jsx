import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/layout/Header';
import MapView from '../components/map/MapView';
import Sidebar from '../components/sidebar/Sidebar';
import BusList from '../components/sidebar/BusList';
import Analytics from '../components/analytics/Analytics'; // Dummy file
import { busRoutePaths as defaultBusRoutePaths } from '../data/extracted_data';

function Dashboard() {
  const [scheduleType, setScheduleType] = useState('normal');
  const [selectedBuses, setSelectedBuses] = useState([]);
  const [selectedTab, setSelectedTab] = useState('bus'); // <-- Add tab state
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
        console.log(response.data)
        const formatted = Object.entries(response.data).map(([busNumber, path]) => ({
          busNumber,
          routePath: path,
        }));
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
  }, [JSON.stringify(filters)]);

  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
  };

  const handleBusSelect = (busNumber) => {
    setSelectedBuses(prev =>
      prev.includes(busNumber)
        ? prev.filter(b => b !== busNumber)
        : [...prev, busNumber]
    );
  };

  const handleClearFilters = () => {
    setFilters({
      ssnYears: { year1: false, year2: false, year3: false, year4: false },
      snuYears: { year1: false, year2: false, year3: false, year4: false },
      ssnFaculty: false,
      snuFaculty: false,
      maxCapacity: 60,
      distanceThreshold: 3,
      demandIgnoreThreshold: 1,
      maxDemandSumForFarStops: 2
    });
    setSelectedBuses([]);
  };

  const getFilteredBuses = () => {
    if (selectedBuses.length === 0) return routeData;
    return routeData.filter(bus => selectedBuses.includes(bus.busNumber));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <div className="flex h-[900px]">
        {/* Sidebar */}
        <div className="bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
          <Sidebar
            scheduleType={scheduleType}
            onScheduleTypeChange={setScheduleType}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Right Pane */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Tabs */}
          <div className="flex border-b border-gray-300">
            <button
              className={`px-6 py-3 ${selectedTab === 'bus' ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-gray-500'}`}
              onClick={() => setSelectedTab('bus')}
            >
              Bus Routes
            </button>
            <button
              className={`px-6 py-3 ${selectedTab === 'analytics' ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-gray-500'}`}
              onClick={() => setSelectedTab('analytics')}
            >
              Analytics
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedTab === 'bus' ? (
              <BusList
                buses={routeData}
                selectedBuses={selectedBuses}
                onBusSelect={handleBusSelect}
                filters={filters}
              />
            ) : (
              <Analytics busRoutes={getFilteredBuses()}/>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Section: MapView */}
      {/*
      <div className="px-6 pt-4 pb-10">
        <h2 className="text-2xl font-semibold mb-4">Map Visualization</h2>
        <div className="h-[500px] border-t border-gray-300 rounded-lg shadow-md">
          <MapView busRoutes={getFilteredBuses()} />
        </div>
      </div>
      */}
    </div>
  );
}

export default Dashboard;
