// src/components/sidebar/BusList.jsx

function BusList({ buses, selectedBuses, onBusSelect }) {
  return (
    <div className="p-4">
      {buses.length === 0 ? (
        <p className="text-gray-500 text-sm">No buses available</p>
      ) : (
        <ul className="space-y-2 overflow-y-auto">
          {buses.map(bus => (
            <li key={bus.busNumber}>
              <button
                className={`w-full text-left px-3 py-2 rounded-md ${
                  selectedBuses.includes(bus.busNumber)
                    ? 'bg-indigo-100 border-indigo-500 border'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => onBusSelect(bus.busNumber)}
              >
                <div className="font-medium">Bus Route {bus.busNumber}</div>
                {bus.routePath && (
                  <div className="mt-1 text-sm text-gray-600">
                    {bus.routePath.join(' → ')}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BusList;
