// src/components/sidebar/Sidebar.jsx
import { useState } from 'react';
import Filters from './Filters';
import BusList from './BusList';

function Sidebar({ 
  scheduleType, 
  onScheduleTypeChange, 
  filters, 
  onFilterChange,
  onClearFilters,
  buses, 
  selectedBuses, 
  onBusSelect 
}) {
  const [activeTab, setActiveTab] = useState('buses'); // Only 'buses' tab remains
  const [showFilters, setShowFilters] = useState(false); // State to toggle filters

  return (
    <div className="w-96 bg-white shadow-lg overflow-hidden flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        
        {/* Schedule Type Toggle */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Schedule Type:</span>
            <div className="relative inline-block w-32">
              <select
                value={scheduleType}
                onChange={(e) => onScheduleTypeChange(e.target.value)}
                className="block w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="normal">Normal</option>
                <option value="examTime">Exam Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === 'buses' 
              ? 'text-indigo-600 border-b-2 border-indigo-500' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('buses')}
        >
          Bus Routes
        </button>
      </div>
      
      {/* Content based on active tab */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'buses' && (
          <>
            {/* Toggle Filters Button */}
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Filters (conditionally rendered) */}
            {showFilters && (
              <Filters filters={filters} onFilterChange={onFilterChange} onClearFilters={onClearFilters}/>
            )}

            {/* Additional Parameters */}
            {showFilters && (
              <div className="px-4 py-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Max Capacity</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-1"
                  value={filters.maxCapacity || ''}
                  onChange={(e) => onFilterChange({ ...filters, maxCapacity: Number(e.target.value) })}
                />

                <label className="block text-sm font-medium text-gray-700">Distance Threshold (km)</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-1"
                  value={filters.distanceThreshold || ''}
                  onChange={(e) => onFilterChange({ ...filters, distanceThreshold: Number(e.target.value) })}
                />

                <label className="block text-sm font-medium text-gray-700">Demand Ignore Threshold</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-1"
                  value={filters.demandIgnoreThreshold || ''}
                  onChange={(e) => onFilterChange({ ...filters, demandIgnoreThreshold: Number(e.target.value) })}
                />

                <label className="block text-sm font-medium text-gray-700">Max Demand Sum (Far Stops)</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-1"
                  value={filters.maxDemandSumForFarStops || ''}
                  onChange={(e) => onFilterChange({ ...filters, maxDemandSumForFarStops: Number(e.target.value) })}
                />
              </div>
            )}
              
            {/* Clear Filters Button */}
            {/* Bus List */}
            <BusList 
              buses={buses} 
              selectedBuses={selectedBuses} 
              onBusSelect={onBusSelect}
              filters={filters}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Sidebar;