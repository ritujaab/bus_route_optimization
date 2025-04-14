import { useState } from 'react';
import axios from 'axios';

function Filters({ filters, onFilterChange, onClearFilters, handleSubmit }) {

  const handleYearToggle = (university, year) => {
    const key = university === 'ssn' ? 'ssnYears' : 'snuYears';
    onFilterChange({
      ...filters,
      [key]: {
        ...filters[key],
        [year]: !filters[key][year],
      },
    });
  };

  const handleFacultyToggle = (university) => {
    const key = university === 'ssn' ? 'ssnFaculty' : 'snuFaculty';
    onFilterChange({
      ...filters,
      [key]: !filters[key],
    });
  };
  
  const handleClearClick = () => {
    onClearFilters();  // Calls parent function
  };  

  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="font-medium text-gray-700 mb-3">Filters</h3>

      {/* SSN Filters */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">SSN Filters</h4>
        <div className="space-y-2">
          {['year1', 'year2', 'year3', 'year4'].map((year, index) => (
            <label key={year} className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={filters.ssnYears[year]}
                onChange={() => handleYearToggle('ssn', year)}
              />
              <span className="ml-2 text-sm text-gray-700">Year {index + 1}</span>
            </label>
          ))}
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={filters.ssnFaculty}
              onChange={() => handleFacultyToggle('ssn')}
            />
            <span className="ml-2 text-sm text-gray-700">Faculty</span>
          </label>
        </div>
      </div>

      {/* SNU Filters */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">SNU Filters</h4>
        <div className="space-y-2">
          {['year1', 'year2', 'year3', 'year4'].map((year, index) => (
            <label key={year} className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={filters.snuYears[year]}
                onChange={() => handleYearToggle('snu', year)}
              />
              <span className="ml-2 text-sm text-gray-700">Year {index + 1}</span>
            </label>
          ))}
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={filters.snuFaculty}
              onChange={() => handleFacultyToggle('snu')}
            />
            <span className="ml-2 text-sm text-gray-700">Faculty</span>
          </label>
        </div>
      </div>

      <div className="px-4 py-2 space-y-4">
        {/* Max Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Max Capacity
            <span className="ml-1 group relative cursor-pointer inline-block">
              ℹ️
              <span className="absolute left-5 top-0 z-10 hidden group-hover:block w-48 bg-gray-700 text-white text-xs rounded py-1 px-2 shadow-lg">
              The number of passengers that each bus can hold.
              </span>
            </span>
          </label>
          <input
            type="number"
            className="w-full border rounded px-3 py-1"
            value={filters.maxCapacity || ''}
            onChange={(e) => onFilterChange({ ...filters, maxCapacity: Number(e.target.value) })}
          />
        </div>

        {/* Distance Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Distance Threshold (km)
            <span className="ml-1 group relative cursor-pointer inline-block">
              ℹ️
              <span className="absolute left-5 top-0 z-10 hidden group-hover:block w-56 bg-gray-700 text-white text-xs rounded py-1 px-2 shadow-lg">
                If a stop is away from another stop by less than this number of kilometres, then it is eligible for merging.
              </span>
            </span>
          </label>
          <input
            type="number"
            className="w-full border rounded px-3 py-1"
            value={filters.distanceThreshold || ''}
            onChange={(e) => onFilterChange({ ...filters, distanceThreshold: Number(e.target.value) })}
          />
        </div>

        {/* Demand Ignore Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Demand Ignore Threshold
            <span className="ml-1 group relative cursor-pointer inline-block">
              ℹ️
              <span className="absolute left-5 top-0 z-10 hidden group-hover:block w-64 bg-gray-700 text-white text-xs rounded py-1 px-2 shadow-lg">
                When removing a route, this defines the maximum amount of demand we can ignore.
              </span>
            </span>
          </label>
          <input
            type="number"
            className="w-full border rounded px-3 py-1"
            value={filters.demandIgnoreThreshold || ''}
            onChange={(e) => onFilterChange({ ...filters, demandIgnoreThreshold: Number(e.target.value) })}
          />
        </div>

        {/* Max Demand Sum For Far Stops */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Max Demand Sum (Far Stops)
            <span className="ml-1 group relative cursor-pointer inline-block">
              ℹ️
              <span className="absolute left-5 top-0 z-10 hidden group-hover:block w-64 bg-gray-700 text-white text-xs rounded py-1 px-2 shadow-lg">
                When removing a route, this defines the maximum number of people we can ignore.
              </span>
            </span>
          </label>
          <input
            type="number"
            className="w-full border rounded px-3 py-1"
            value={filters.maxDemandSumForFarStops || ''}
            onChange={(e) => onFilterChange({ ...filters, maxDemandSumForFarStops: Number(e.target.value) })}
          />
        </div>

        {/* Min Closer Threshold */}
        <div className='pb-5'>
          <label className="block text-sm font-medium text-gray-700">
            Minimum Closer Threshold
            <span className="ml-1 group relative cursor-pointer inline-block">
              ℹ️
              <span className="absolute left-5 top-0 z-10 hidden group-hover:block w-64 bg-gray-700 text-white text-xs rounded py-1 px-2 shadow-lg">
              In each step, we must go closer to college by at least this number of kilometers.
              </span>
            </span>
          </label>
          <input
            type="number"
            className="w-full border rounded px-3 py-1"
            value={filters.minCloserThreshold || ''}
            onChange={(e) => onFilterChange({ ...filters, minCloserThreshold: Number(e.target.value) })}
          />
        </div>
      </div>


      {/* Buttons */}
      <div className="flex flex-col gap-2">
        <button
          className="w-full py-2 bg-indigo-600 text-white rounded-md flex items-center justify-center"
          onClick={handleSubmit}
        >
        Apply Filters
        </button>

        <button
          className="w-full py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          onClick={handleClearClick}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

export default Filters;
