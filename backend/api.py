from flask import Flask, jsonify, request
import pandas as pd
import os
from flask_cors import CORS
import json
from main import merge

app = Flask(__name__)
CORS(app)
MERGED_ROUTE_FOLDER = "merged_routes"

# ✅ Route to get routes like group_1_routes.json
@app.route("/api/routes/<group_name>")
def get_routes_for_group(group_name):
    filename = f"{group_name}_routes.json"  # e.g., group_1_routes.json
    filepath = os.path.join(MERGED_ROUTE_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "Group not found"}), 404
    with open(filepath, "r") as f:
        data = json.load(f)
    return jsonify(data)

@app.route("/api/stops")
def get_stop_coordinates():
    xls = pd.ExcelFile("cleaned_file.xlsx")
    coords = {}

    for sheet_name in xls.sheet_names:
        if sheet_name.strip()[0].isdigit():  # sheet name starts with a number like "1", "2", etc.
            df = xls.parse(sheet_name)
            if {'Location', 'Latitude', 'Longitude'}.issubset(df.columns):
                for _, row in df.iterrows():
                    loc = str(row["Location"]).strip().lower()
                    lat = row["Latitude"]
                    lng = row["Longitude"]
                    if pd.notna(loc) and pd.notna(lat) and pd.notna(lng):
                        coords[loc] = [lat, lng]

    return jsonify(coords)

@app.route("/api/get_routes")
def get_all_routes():
    all_routes = {}
    for filename in os.listdir(MERGED_ROUTE_FOLDER):
        if filename.endswith('_routes.json'):
            filepath = os.path.join(MERGED_ROUTE_FOLDER, filename)
            try:
                with open(filepath, 'r') as f:
                    data = json.load(f)
                    all_routes.update(data)
            except Exception as e:
                print(f"Error reading {filename}: {e}")

    # Sort routes by name for consistent display
    sorted_routes = dict(sorted(all_routes.items(), key=lambda x: x[0].lower()))
    return jsonify(sorted_routes)

@app.route("/api/merge_routes", methods=["POST"])
def merge_routes_api():
    try:
        # Get the filters from the request JSON data
        filters = request.get_json()

        # Merge the selected route groups using the provided filters
        # Note: `filters` is passed into the merge function, as required in main.py
        merged_routes, logs = merge(filters)

        # Return the result in a structured JSON response
        return jsonify({
            "message": "Merge successful",
            "merged_routes": merged_routes,
            "logs": logs
        })
    except Exception as e:
        # Catch any errors and return a 500 status with the error message
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
