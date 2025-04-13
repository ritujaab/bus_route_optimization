// src/services/busService.js
// This service would handle API calls to your backend for bus data
import { 
    busStrengths, 
    stopwisePassengerCount, 
    stopLocations,
    busRoutes,
    busRoutePaths,
    passengers,
  } from '../data/extracted_data';
  
  // Get all buses
  export const getAllBuses = async () => {
    // In a real app, this would fetch from an API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(busRoutes);
      }, 300);
    });
  };
  
  // Get bus route details
  export const getBusRouteDetails = async (busNumber) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const route = busRoutes.find(r => r.busNumber === busNumber);
        resolve(route || null);
      }, 200);
    });
  };
  
  // Get bus strengths
  export const getBusStrengths = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(busStrengths);
      }, 200);
    });
  };
  
  // Get stop-wise passenger counts
  export const getStopwisePassengerCounts = async (busNumber = null) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (busNumber) {
          const filteredCounts = stopwisePassengerCount.filter(s => s.busNumber === busNumber);
          resolve(filteredCounts);
        } else {
          resolve(stopwisePassengerCount);
        }
      }, 200);
    });
  };
  
  // Get all stop locations
  export const getStopLocations = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(stopLocations);
      }, 200);
    });
  };
  
  // Get route paths for map visualization
  export const getRoutePaths = async (busNumbers = []) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (busNumbers.length > 0) {
          const filteredPaths = busRoutePaths.filter(p => busNumbers.includes(p.busNumber));
          resolve(filteredPaths);
        } else {
          resolve(busRoutePaths);
        }
      }, 200);
    });
  };
  
  // Get passengers by bus route
  export const getPassengersByRoute = async (routeNo) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredPassengers = passengers.filter(p => p.routeNo === routeNo);
        resolve(filteredPassengers);
      }, 300);
    });
  };