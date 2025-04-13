// src/components/sidebar/Filters.jsx
import { useState } from 'react';

function Filters({ filters, onFilterChange }) {
  const handleUniversityChange = (university) => {
    onFilterChange({
      ...filters,
      university,
    });
  };

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

  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="font-medium text-gray-700 mb-3">Filters</h3>

      {/* University Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              filters.university === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleUniversityChange('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              filters.university === 'ssn'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleUniversityChange('ssn')}
          >
            SSN
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              filters.university === 'snu'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleUniversityChange('snu')}
          >
            SNU
          </button>
        </div>
      </div>

      {/* SSN Filters */}
      {(filters.university === 'ssn' || filters.university === 'all') && (
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
      )}

      {/* SNU Filters */}
      {(filters.university === 'snu' || filters.university === 'all') && (
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
      )}
    </div>
  );
}

export default Filters;