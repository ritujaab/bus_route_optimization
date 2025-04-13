// src/components/sidebar/BusList.jsx

function BusList({ buses, selectedBuses, onBusSelect }) {
  return (
    <div className="p-4">
      <h3 className="font-medium text-gray-700 mb-3">Bus Routes</h3>

      {buses.length === 0 ? (
        <p className="text-gray-500 text-sm">No buses available</p>
      ) : (
        <ul className="space-y-2">
          {buses.map(bus => (
            <li key={bus.busNumber}>
            {console.log(bus.stops)}
              <button
                className={`w-full text-left px-3 py-2 rounded-md ${
                  selectedBuses.includes(bus.busNumber)
                    ? 'bg-indigo-100 border-indigo-500 border'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => onBusSelect(bus.busNumber)}
              >
                <div className="font-medium">{bus.busNumber}</div>
                {bus.path && (
                  <div className="mt-1 text-sm text-gray-600">
                    {bus.stops.join(' → ')}
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
