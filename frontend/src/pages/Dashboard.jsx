import { useEffect, useState } from 'react';
import axios from 'axios';

import Header from '../components/layout/Header';
import MapView from '../components/map/MapView';
import Sidebar from '../components/sidebar/Sidebar';
import BusList from '../components/sidebar/BusList';
import Analytics from '../components/analytics/Analytics';

import { busRoutePaths as defaultBusRoutePaths } from '../data/extracted_data';

function Dashboard() {
  const [scheduleType, setScheduleType] = useState('normal');
  const [selectedBuses, setSelectedBuses] = useState([]);
  const [selectedTab, setSelectedTab] = useState('bus');
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    ssnYears: { year1: false, year2: false, year3: false, year4: false },
    snuYears: { year1: false, year2: false, year3: false, year4: false },
    ssnFaculty: false,
    snuFaculty: false,
    maxCapacity: 60,
    distanceThreshold: 3,
    demandIgnoreThreshold: 1,
    maxDemandSumForFarStops: 2,
    minCloserThreshold: 0.5,
  });

  const [routeData, setRouteData] = useState([]);

  const handleSubmit = async () => {
    setLoading(true);

    const payload = { Filters: {}, Constraints: {} };

    const ssnData = [];
    Object.entries(filters.ssnYears).forEach(([_, value], idx) => {
      if (value) ssnData.push(idx + 1);
    });
    if (filters.ssnFaculty) ssnData.push('Faculty');
    if (ssnData.length > 0) payload.Filters['SSN'] = ssnData;

    const snuData = [];
    Object.entries(filters.snuYears).forEach(([_, value], idx) => {
      if (value) snuData.push(idx + 1);
    });
    if (filters.snuFaculty) snuData.push('Faculty');
    if (snuData.length > 0) payload.Filters['SNU'] = snuData;

    payload.Constraints = {
      MAX_CAPACITY: filters.maxCapacity,
      DISTANCE_THRESHOLD: filters.distanceThreshold,
      DEMAND_IGNORE_THRESHOLD: filters.demandIgnoreThreshold,
      MAX_DEMAND_SUM_FOR_FAR_STOPS: filters.maxDemandSumForFarStops,
      MIN_CLOSER_THRESHOLD: filters.minCloserThreshold,
    };

    try {
      console.log('Sending payload:', payload);
      await axios.post('http://localhost:5000/api/merge_routes', payload);
      fetchRoutes();
    } catch (error) {
      console.error('Error during merge:', error);
    }

    setLoading(false);
  };

  const isFilterApplied = () =>
    filters.ssnFaculty ||
    filters.snuFaculty ||
    Object.values(filters.ssnYears).includes(true) ||
    Object.values(filters.snuYears).includes(true);

  const fetchRoutes = async () => {
    if (isFilterApplied()) {
      try {
        const response = await axios.get('http://localhost:5000/api/get_routes');
        const formatted = Object.entries(response.data).map(([busNumber, path]) => ({
          busNumber,
          routePath: path,
        }));
        setRouteData(formatted);
      } catch (error) {
        console.error('Error fetching merged route data:', error);
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

  const handleClearFilters = () => {
    setFilters({
      ssnYears: { year1: false, year2: false, year3: false, year4: false },
      snuYears: { year1: false, year2: false, year3: false, year4: false },
      ssnFaculty: false,
      snuFaculty: false,
      maxCapacity: 60,
      distanceThreshold: 3,
      demandIgnoreThreshold: 1,
      maxDemandSumForFarStops: 2,
      minCloserThreshold: 0.5,
    });
    setSelectedBuses([]);
  };

  const handleBusSelect = (busNumber) => {
    setSelectedBuses(prev =>
      prev.includes(busNumber)
        ? prev.filter(b => b !== busNumber)
        : [...prev, busNumber]
    );
  };

  const getFilteredBuses = () => {
    if (selectedBuses.length === 0) return routeData;
    return routeData.filter(bus => selectedBuses.includes(bus.busNumber));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <div className="flex h-[1000px]">
        {/* Sidebar */}
        <div className="bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
          <Sidebar
            scheduleType={scheduleType}
            onScheduleTypeChange={setScheduleType}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            handleFilterSubmit={handleSubmit}
          />
        </div>

        {/* Right Pane */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Tabs */}
          <div className="flex border-b border-gray-300">
            <button
              className={`px-6 py-3 ${
                selectedTab === 'bus'
                  ? 'border-b-2 border-blue-600 font-semibold text-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setSelectedTab('bus')}
            >
              Bus Routes
            </button>
            <button
              className={`px-6 py-3 ${
                selectedTab === 'analytics'
                  ? 'border-b-2 border-blue-600 font-semibold text-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setSelectedTab('analytics')}
            >
              Analytics
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full text-xl text-gray-600">
                Loading...
              </div>
            ) : selectedTab === 'bus' ? (
              <BusList
                buses={routeData}
                selectedBuses={selectedBuses}
                onBusSelect={handleBusSelect}
                filters={filters}
              />
            ) : (
              <Analytics busRoutes={getFilteredBuses()} />
            )}
          </div>
        </div>
      </div>

      {/* Optional Map Section */}
      
      <div className="px-6 pt-4 pb-10">
        <h2 className="text-2xl font-semibold mb-4">Map Visualization</h2>
        <div className="h-[500px] border-t border-gray-300 rounded-lg shadow-md">
          <MapView busRoutes={getFilteredBuses()} />
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
