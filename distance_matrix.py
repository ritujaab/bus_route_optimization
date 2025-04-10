import osmnx as ox
import networkx as nx
import pandas as pd
from geopy.distance import great_circle
import time
import os
import pickle

# Cache directory setup
CACHE_DIR = "osmnx_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

def get_graph_cache_filename(bbox):
    """Generate a consistent cache filename based on bounding box"""
    bbox_str = "_".join([f"{coord:.6f}" for coord in bbox])
    return os.path.join(CACHE_DIR, f"graph_{bbox_str}.pkl")

def load_cached_graph(bbox):
    """Try to load a cached graph"""
    cache_file = get_graph_cache_filename(bbox)
    if os.path.exists(cache_file):
        try:
            with open(cache_file, 'rb') as f:
                print("Loading cached road network...")
                return pickle.load(f)
        except:
            print("Cache file corrupted, will re-download")
    return None

def save_graph_to_cache(graph, bbox):
    """Save graph to cache"""
    cache_file = get_graph_cache_filename(bbox)
    try:
        with open(cache_file, 'wb') as f:
            pickle.dump(graph, f)
    except:
        print("Warning: Failed to save graph to cache")

def create_distance_matrix(stops, college_stop, location_col='Location', lat_col='Latitude', lon_col='Longitude'):
    """
    Create a distance matrix using OSMnx for road network distances.
    Falls back to haversine if OSMnx fails.
    """
    # Get all unique stops
    all_stops = stops[location_col].unique().tolist()

    # Ensure college is only included once
    if college_stop in all_stops:
        all_stops = [s for s in all_stops if s != college_stop] + [college_stop]

    # First try with OSMnx for road distances
    distance_matrix = try_osmnx_matrix(stops, all_stops, location_col, lat_col, lon_col)

    # If OSMnx failed, use haversine
    if distance_matrix is None:
        print("Falling back to haversine distance calculations")
        distance_matrix = create_haversine_matrix(stops, all_stops, location_col, lat_col, lon_col)

    return distance_matrix

def try_osmnx_matrix(stops, all_stops, location_col, lat_col, lon_col):
    """Attempt to create matrix using OSMnx, return None if fails"""
    try:
        # Get the bounding box from the min/max lat and lon
        min_lat = stops[lat_col].min()
        max_lat = stops[lat_col].max()
        min_lon = stops[lon_col].min()
        max_lon = stops[lon_col].max()

        # Define the bounding box as (left, bottom, right, top)
        bbox = (min_lon, min_lat, max_lon, max_lat)

        # Try to load from cache first
        G = load_cached_graph(bbox)
        
        if G is None:
            print("Downloading road network (this only happens once)...")
            G = ox.graph_from_bbox(max_lat, min_lat, max_lon, min_lon, network_type='drive')
            G = ox.add_edge_speeds(G)
            G = ox.add_edge_travel_times(G)
            save_graph_to_cache(G, bbox)
        else:
            print("Using cached road network")

        print("Calculating distances...")

        # Get nearest nodes for all stops
        nodes = {}
        for stop in all_stops:
            stop_data = stops[stops[location_col] == stop].iloc[0]
            try:
                nodes[stop] = ox.distance.nearest_nodes(G,
                                                      X=stop_data[lon_col],
                                                      Y=stop_data[lat_col])
            except ValueError as e:
                print(f"Warning: Could not find nearest node for {stop} using OSMnx. Falling back to haversine for this stop. Error: {e}")
                nodes[stop] = None

        # Calculate distance matrix
        distance_matrix = {}
        for i, from_stop in enumerate(all_stops):
            distance_matrix[from_stop] = {}
            from_node = nodes.get(from_stop)

            for to_stop in all_stops:
                if from_stop == to_stop:
                    distance_matrix[from_stop][to_stop] = 0
                    continue

                to_node = nodes.get(to_stop)
                if from_node is not None and to_node is not None:
                    try:
                        path_length = nx.shortest_path_length(G, from_node, to_node, weight='length')
                        distance_matrix[from_stop][to_stop] = path_length / 1000  # km
                    except nx.NetworkXNoPath:
                        # Fallback to haversine if no path
                        from_loc = stops[stops[location_col] == from_stop].iloc[0]
                        to_loc = stops[stops[location_col] == to_stop].iloc[0]
                        distance = great_circle((from_loc[lat_col], from_loc[lon_col]),
                                                (to_loc[lat_col], to_loc[lon_col])).km
                        distance_matrix[from_stop][to_stop] = distance
                else:
                    # If nearest node couldn't be found for either stop, fallback to haversine
                    from_loc = stops[stops[location_col] == from_stop].iloc[0]
                    to_loc = stops[stops[location_col] == to_stop].iloc[0]
                    distance = great_circle((from_loc[lat_col], from_loc[lon_col]),
                                            (to_loc[lat_col], to_loc[lon_col])).km
                    distance_matrix[from_stop][to_stop] = distance

            if (i + 1) % 5 == 0:
                print(f"Processed {i + 1}/{len(all_stops)} stops")

        return distance_matrix

    except Exception as e:
        print(f"OSMnx failed: {str(e)}")
        return None

def create_haversine_matrix(stops, all_stops, location_col, lat_col, lon_col):
    """Create distance matrix using haversine formula"""
    print("Creating haversine distance matrix...")
    distance_matrix = {}

    for i, from_stop in enumerate(all_stops):
        distance_matrix[from_stop] = {}
        from_loc = stops[stops[location_col] == from_stop].iloc[0]

        for to_stop in all_stops:
            if from_stop == to_stop:
                distance_matrix[from_stop][to_stop] = 0
                continue

            to_loc = stops[stops[location_col] == to_stop].iloc[0]
            distance = great_circle((from_loc[lat_col], from_loc[lon_col]),
                                    (to_loc[lat_col], to_loc[lon_col])).km
            distance_matrix[from_stop][to_stop] = distance

        if (i + 1) % 5 == 0:
            print(f"Processed {i + 1}/{len(all_stops)} stops")

    return distance_matrix