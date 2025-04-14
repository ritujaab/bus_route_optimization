from copy import deepcopy
from datetime import datetime
import json

class MergeLogger:
    def __init__(self):
        self.log = {
            'timestamp': datetime.now().isoformat(),
            'initial_routes': {},
            'removed_routes': [],
            'merge_operations': [],
            'final_routes': {},
            'demand_changes': []
        }
    
    def log_initial_state(self, routes, route_demands, route_stop_demands):
        """Log initial state using route_stop_demands to avoid double-counting"""
        self.log['initial_routes'] = {
            route_id: {
                'stops': stops,
                'total_demand': sum(route_stop_demands[route_id].values()),
                'stop_demands': route_stop_demands[route_id]
            }
            for route_id, stops in routes.items()
        }
    
    def log_route_removal(self, route_id, stops_assigned):
        self.log['removed_routes'].append({
            'route_id': route_id,
            'stops_assigned': stops_assigned
        })
    
    def log_merge_operation(self, from_route, to_route, stop, demand, insert_pos):
        self.log['merge_operations'].append({
            'from_route': from_route,
            'to_route': to_route,
            'stop': stop,
            'demand': demand,
            'insert_position': insert_pos,
            'timestamp': datetime.now().isoformat()
        })
    
    def log_final_state(self, routes, route_demands):
        self.log['final_routes'] = {
            route_id: {
                'stops': stops,
                'total_demand': route_demands[route_id]
            }
            for route_id, stops in routes.items()
        }
    
    def save_log(self, filename='route_merge_log.json'):
        with open(filename, 'w') as f:
            json.dump(self.log, f, indent=2)
        return self.log

def merge_routes(routes, stop_demands, distance_matrix, college_stop, route_stop_demands, faculty_stops, constraints):
    """
    Merge routes while respecting constraints with proper demand calculation.
    If no route can be removed, revert to original routes.
    """
    MAX_CAPACITY = constraints['MAX_CAPACITY']
    DISTANCE_THRESHOLD = constraints['DISTANCE_THRESHOLD']
    DEMAND_IGNORE_THRESHOLD = constraints['DEMAND_IGNORE_THRESHOLD']
    MAX_DEMAND_SUM_FOR_FAR_STOPS = constraints['MAX_DEMAND_SUM_FOR_FAR_STOPS']
    MIN_CLOSER_THRESHOLD = constraints['MIN_CLOSER_THRESHOLD']

    # Save original routes and demands
    original_routes = deepcopy(routes)
    logger = MergeLogger()
    
    if route_stop_demands is None:
        route_stop_demands = {}
        stop_route_count = {}
        
        for route_id, stops in routes.items():
            for stop in stops:
                stop_route_count[stop] = stop_route_count.get(stop, 0) + 1
        
        for route_id, stops in routes.items():
            route_stop_demands[route_id] = {}
            for stop in stops:
                route_stop_demands[route_id][stop] = stop_demands.get(stop, 0) / stop_route_count[stop]
    else:
        route_stop_demands = deepcopy(route_stop_demands)
    
    original_route_stop_demands = deepcopy(route_stop_demands)
    
    route_demands = {
        route_id: sum(demands.values())
        for route_id, demands in route_stop_demands.items()
    }
    
    logger.log_initial_state(original_routes, route_demands, original_route_stop_demands)
    
    any_route_removed = False
    alive_routes = deepcopy(routes)
    
    while True:
        route_removed = False
        
        for remove_route_id in list(alive_routes.keys()):
            candidate_route = alive_routes[remove_route_id]
            stops_assigned = []
            
            stop_assignments = []
            temp_routes = deepcopy(alive_routes)
            temp_route_demands = deepcopy(route_demands)
            temp_route_stop_demands = deepcopy(route_stop_demands)
            
            all_stops_assigned = True
            far_demand_sum = 0
            
            for stop in candidate_route:
                stop_route_demand = route_stop_demands[remove_route_id].get(stop, 0)
                
                if stop_route_demand <= DEMAND_IGNORE_THRESHOLD and stop not in faculty_stops:
                    continue
                
                best_increase = float('inf')
                best_route_id = None
                best_insert_pos = None
                stop_to_college_dist = distance_matrix[stop][college_stop]
                
                for alive_route_id, alive_stops in temp_routes.items():
                    if alive_route_id == remove_route_id:
                        continue
                    
                    if temp_route_demands[alive_route_id] + stop_route_demand > MAX_CAPACITY:
                        continue
                    
                    for i in range(len(alive_stops)):
                        current_stop = alive_stops[i]
                        current_to_college_dist = distance_matrix[current_stop][college_stop]
                        
                        if stop_to_college_dist + MIN_CLOSER_THRESHOLD >= current_to_college_dist: # Modify this line
                            continue
                        
                        next_stop = alive_stops[i+1] if i < len(alive_stops) - 1 else college_stop
                        next_to_college_dist = distance_matrix[next_stop][college_stop]
                        
                        if i < len(alive_stops) - 1 and not (
                            current_to_college_dist >= stop_to_college_dist >= next_to_college_dist
                        ):
                            continue
                        
                        dist_current_to_next = distance_matrix[current_stop][next_stop]
                        dist_current_to_stop = distance_matrix[current_stop][stop]
                        dist_stop_to_next = distance_matrix[stop][next_stop]
                        increase = dist_current_to_stop + dist_stop_to_next - dist_current_to_next
                        
                        if increase < DISTANCE_THRESHOLD and increase < best_increase:
                            best_increase = increase
                            best_route_id = alive_route_id
                            best_insert_pos = i + 1
                
                if best_route_id is not None:
                    stop_assignments.append((stop, best_route_id, best_insert_pos))
                    temp_routes[best_route_id].insert(best_insert_pos, stop)
                    
                    temp_route_stop_demands[best_route_id][stop] = temp_route_stop_demands[best_route_id].get(stop, 0) + stop_route_demand
                    temp_route_demands[best_route_id] += stop_route_demand
                    
                    logger.log_merge_operation(
                        remove_route_id,
                        best_route_id,
                        stop,
                        stop_route_demand,
                        best_insert_pos
                    )
                    
                    stops_assigned.append({
                        'stop': stop,
                        'to_route': best_route_id,
                        'demand': stop_route_demand,
                        'position': best_insert_pos
                    })
                    
                    if best_increase > DISTANCE_THRESHOLD / 2:
                        far_demand_sum += stop_route_demand
                else:
                    all_stops_assigned = False
                    break
            
            if all_stops_assigned and far_demand_sum <= MAX_DEMAND_SUM_FOR_FAR_STOPS:
                alive_routes = temp_routes
                route_demands = temp_route_demands
                route_stop_demands = temp_route_stop_demands
                
                logger.log_route_removal(remove_route_id, stops_assigned)
                
                del alive_routes[remove_route_id]
                del route_demands[remove_route_id]
                del route_stop_demands[remove_route_id]
                
                route_removed = True
                any_route_removed = True
                break
        
        if not route_removed:
            break
    
    if not any_route_removed:
        print("No routes could be merged. Reverting to original routes.")
        alive_routes = original_routes
        route_stop_demands = original_route_stop_demands
        route_demands = {
            route_id: sum(demands.values())
            for route_id, demands in original_route_stop_demands.items()
        }
    
    logger.log_final_state(alive_routes, {
        route_id: sum(demands.values())
        for route_id, demands in route_stop_demands.items()
    })
    
    merge_log = logger.save_log()
    return alive_routes, merge_log
