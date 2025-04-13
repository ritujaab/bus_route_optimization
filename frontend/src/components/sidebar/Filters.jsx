import { useState } from 'react';
import axios from 'axios';

function Filters({ filters, onFilterChange, onClearFilters }) {
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async () => {
    setLoading(true);
  
    const payload = {'Filters':{}, 'Constraints':{}};
  
    const ssnData = [];
    Object.entries(filters.ssnYears).forEach(([_, value], idx) => {
      if (value) ssnData.push(idx + 1);
    });
    if (filters.ssnFaculty) ssnData.push("Faculty");
    if (ssnData.length > 0) payload['Filters']["SSN"] = ssnData;
  
    const snuData = [];
    Object.entries(filters.snuYears).forEach(([_, value], idx) => {
      if (value) snuData.push(idx + 1);
    });
    if (filters.snuFaculty) snuData.push("Faculty");
    if (snuData.length > 0) payload['Filters']["SNU"] = snuData;
  
    // ✅ Add constraints to payload
    if (filters.maxCapacity) payload['Constraints']["MAX_CAPACITY"] = filters.maxCapacity;
    if (filters.distanceThreshold) payload['Constraints']["DISTANCE_THRESHOLD"] = filters.distanceThreshold;
    if (filters.demandIgnoreThreshold) payload['Constraints']["DEMAND_IGNORE_THRESHOLD"] = filters.demandIgnoreThreshold;
    if (filters.maxDemandSumForFarStops) payload['Constraints']["MAX_DEMAND_SUM_FOR_FAR_STOPS"] = filters.maxDemandSumForFarStops;
  
    try {
      console.log("Sending payload:", payload);
      const response = await axios.post('http://localhost:5000/api/merge_routes', payload);
      console.log('Merge successful:', response.data);
    } catch (error) {
      console.error('Error during merge:', error);
    }
  
    setLoading(false);
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

      {/* Buttons */}
      <div className="flex flex-col gap-2">
        <button
          className="w-full py-2 bg-indigo-600 text-white rounded-md flex items-center justify-center"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Applying...
            </>
          ) : (
            'Apply Filters'
          )}
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
