import { useEffect, useState } from 'react';
import { busRoutePaths as defaultBusRoutePaths } from '../../data/extracted_data';
import { FaBus, FaTimesCircle, FaPlusCircle, FaExchangeAlt } from 'react-icons/fa';

function Analytics({ busRoutes,logs}) {
  const [analytics, setAnalytics] = useState({
    removedBuses: [],
    movedStops: [],
    addedBuses: [],
  });

  useEffect(() => {
    const defaultBusRoutes = defaultBusRoutePaths.map(route => ({
      busNumber: route.busNumber,
      routePath: route.path,
    }));

    // Initialize analytics data
    const removedBuses = [];
    const movedStops = [];
    const addedBuses = [];

    // Function to remove overlapping stops between removed and added stops
    const removeOverlappingStops = (removedStops, addedStops) => {
      const removedSet = new Set(removedStops);
      const addedSet = new Set(addedStops);

      // Remove stops that are both in removed and added sets
      removedStops = [...removedSet].filter(stop => !addedSet.has(stop));
      addedStops = [...addedSet].filter(stop => !removedSet.has(stop));

      return {
        removedStops,
        addedStops,
      };
    };

    // Find removed buses
    defaultBusRoutes.forEach((defaultRoute) => {
      const matchingRoute = busRoutes.find((route) => route.busNumber === defaultRoute.busNumber);
      if (!matchingRoute) {
        removedBuses.push(defaultRoute.busNumber);
      } else {
        // Compare stops for this bus route
        const removedStops = defaultRoute.routePath.filter(stop => !matchingRoute.routePath.includes(stop));
        const addedStops = matchingRoute.routePath.filter(stop => !defaultRoute.routePath.includes(stop));

        // Remove overlapping stops
        const { removedStops: updatedRemovedStops, addedStops: updatedAddedStops } = removeOverlappingStops(removedStops, addedStops);

        if (updatedRemovedStops.length > 0 || updatedAddedStops.length > 0) {
          movedStops.push({
            busNumber: defaultRoute.busNumber,
            removedStops: updatedRemovedStops,
            addedStops: updatedAddedStops,
          });
        }
      }
    });

    // Find added buses
    busRoutes.forEach((route) => {
      const matchingRoute = defaultBusRoutes.find((defaultRoute) => defaultRoute.busNumber === route.busNumber);
      if (!matchingRoute) {
        addedBuses.push(route.busNumber);
      }
    });

    // Update the analytics state with the differences
    setAnalytics({
      removedBuses,
      movedStops,
      addedBuses,
    });
  }, [busRoutes]);

  return (
    <div className="p-6 text-gray-800">
    {logs && logs.length > 0 && (() => {
      let total_initial_routes = 0;
      let total_removed_routes = 0;
      let total_final_routes = 0;
      let total_merge_ops = 0;

      logs.forEach(log => {
        total_initial_routes += log.initial_routes ? Object.keys(log.initial_routes).length : 0;
        total_removed_routes += Array.isArray(log.removed_routes) ? log.removed_routes.length : 0;
        total_final_routes += log.final_routes ? Object.keys(log.final_routes).length : 0;
        total_merge_ops += Array.isArray(log.merge_operations) ? log.merge_operations.length : 0;
      });

      const route_reduction_percentage = total_initial_routes > 0
        ? ((total_removed_routes / total_initial_routes) * 100).toFixed(2)
        : "0.00";

      return (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Overall Statistics</h2>
          <ul className="text-sm text-blue-800 list-disc pl-5 space-y-1">
            <li>Total initial routes: {total_initial_routes}</li>
            <li>Total removed routes: {total_removed_routes}</li>
            <li>Total final routes: {total_final_routes}</li>
            <li>Total merge operations: {total_merge_ops}</li>
            <li>Route reduction: {total_removed_routes} ({route_reduction_percentage}%)</li>
          </ul>
        </div>
      );
    })()}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Removed Buses Card */}
        {analytics.removedBuses.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <FaTimesCircle className="text-red-600 text-xl" />
              <h3 className="text-lg font-semibold text-gray-800">Removed Buses</h3>
            </div>
            <ul className="mt-4 list-disc pl-5">
              {analytics.removedBuses.map((busNumber) => (
                <li key={busNumber} className="text-sm text-gray-700">Bus {busNumber}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Moved Stops Card */}
        {analytics.movedStops.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <FaExchangeAlt className="text-yellow-500 text-xl" />
              <h3 className="text-lg font-semibold text-gray-800">Moved Stops</h3>
            </div>
            {analytics.movedStops.map(({ busNumber, removedStops, addedStops }) => (
              <div key={busNumber} className="mt-4">
                <p className="text-sm font-medium text-gray-800">Bus {busNumber}:</p>
                {removedStops.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-red-600">Removed Stops:</p>
                    <ul className="list-disc pl-5">
                      {removedStops.map((stop) => (
                        <li key={stop} className="text-sm text-gray-700">{stop}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {addedStops.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">Added Stops:</p>
                    <ul className="list-disc pl-5">
                      {addedStops.map((stop) => (
                        <li key={stop} className="text-sm text-gray-700">{stop}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* If no changes */}
      {analytics.removedBuses.length === 0 && analytics.movedStops.length === 0 && analytics.addedBuses.length === 0 && (
        <p className="text-center text-gray-600 mt-6">No changes detected in the routes.</p>
      )}
    </div>
  );
}

export default Analytics;
