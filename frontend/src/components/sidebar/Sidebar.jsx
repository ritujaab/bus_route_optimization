import { useState } from 'react';
import Filters from './Filters';

function Sidebar({ 
  scheduleType, 
  onScheduleTypeChange, 
  filters, 
  onFilterChange,
  onClearFilters,
}) {
  return (
    <div className="w-96 bg-white shadow-lg overflow-y-auto flex flex-col border-r border-gray-200">
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
      
      <div className="flex-1 overflow-y-auto">
        <Filters filters={filters} onFilterChange={onFilterChange} onClearFilters={onClearFilters} />
      </div>
    </div>
  );
}

export default Sidebar;
