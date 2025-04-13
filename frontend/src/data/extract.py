import pandas as pd
import os
import json
import re

def extract_bus_strengths(excel_file):
    try:
        df = pd.read_excel(excel_file, sheet_name="Bus Strengths")
        df.columns = [col.strip() for col in df.columns]
        bus_strengths = []

        for _, row in df.iterrows():
            bus_data = {
                "busNumber": str(row["Bus Number"]).strip(),
                "totalPassengers": int(row["Total Passengers"])
            }
            if "University" in df.columns:
                bus_data["university"] = row["University"]
            bus_strengths.append(bus_data)
        return bus_strengths
    except Exception as e:
        print(f"Error extracting bus strengths: {e}")
        return []

def extract_stopwise_passenger_count(excel_file):
    try:
        df = pd.read_excel(excel_file, sheet_name="Stop-wise Passenger Count")
        df.columns = [col.strip() for col in df.columns]
        stopwise_data = []

        for _, row in df.iterrows():
            stopwise_data.append({
                "busNumber": str(row["Bus Number"]).strip(),
                "stopName": str(row["Stop Name"]).strip(),
                "passengerCount": int(row["Passenger Count"])
            })
        return stopwise_data
    except Exception as e:
        print(f"Error extracting stopwise passenger count: {e}")
        return []

def is_location_sheet(sheet_name):
    return bool(re.match(r'^\d+[a-z]?$', sheet_name))

def extract_stop_locations(excel_file):
    try:
        xl = pd.ExcelFile(excel_file)
        location_sheets = [sheet for sheet in xl.sheet_names if is_location_sheet(sheet)]

        if not location_sheets:
            print("Could not find any sheets for stop locations")
            return []

        stop_locations = []
        for sheet_name in location_sheets:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            df.columns = [col.strip() for col in df.columns]

            for _, row in df.iterrows():
                location_data = {
                    "busNumber": f"Bus {sheet_name}",
                    "latitude": float(row["Latitude"]),
                    "longitude": float(row["Longitude"]),
                    "location": str(row["Location"]).strip()
                }
                if "Exact Location" in df.columns:
                    location_data["exactLocation"] = str(row["Exact Location"]).strip()

                stop_locations.append(location_data)
        return stop_locations
    except Exception as e:
        print(f"Error extracting stop locations: {e}")
        return []

def extract_passengers(excel_file):
    try:
        found_sheet = None
        xl = pd.ExcelFile(excel_file)

        for sheet_name in xl.sheet_names:
            try:
                test_df = pd.read_excel(excel_file, sheet_name=sheet_name, nrows=1)
                if "Unique ID" in test_df.columns and "Digital ID" in test_df.columns:
                    found_sheet = sheet_name
                    break
            except:
                continue

        if not found_sheet:
            print("Could not find a sheet for passenger data")
            return []

        df = pd.read_excel(excel_file, sheet_name=found_sheet)
        df.columns = [col.strip() for col in df.columns]
        passengers_data = []

        for _, row in df.iterrows():
            try:
                passenger = {
                    "uniqueId": str(row["Unique ID"]).strip(),
                    "digitalId": str(row["Digital ID"]).strip(),
                    "name": str(row["Name"]).strip(),
                    "mobileNumber": str(row["Mobile Number"]).strip(),
                    "department": str(row["Department"]).strip(),
                    "year": int(row["Year"]) if pd.notna(row["Year"]) else 0,
                    "semester": str(row["Semester"]).strip(),
                    "boardingPoint": str(row["Boarding Point"]).strip(),
                    "routeNo": str(row["Route No"]).strip(),
                    "originalPoints": str(row["Original Points"]).strip(),
                    "university": str(row["University"]).strip()
                }
                passengers_data.append(passenger)
            except Exception as e:
                print(f"Error processing passenger row: {e}")
                continue
        return passengers_data
    except Exception as e:
        print(f"Error extracting passengers data: {e}")
        return []

def is_location_sheet(sheet_name):
    return bool(re.match(r'^\d+[a-z]?$', sheet_name))

def generate_route_paths_from_locations(excel_file):
    try:
        xl = pd.ExcelFile(excel_file)
        location_sheets = [sheet for sheet in xl.sheet_names if is_location_sheet(sheet)]

        if not location_sheets:
            print("No location sheets found.")
            return []

        route_paths = []
        for sheet_name in sorted(location_sheets, key=lambda x: (int(re.findall(r'\d+', x)[0]), x)):
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            df.columns = [col.strip() for col in df.columns]

            path = []
            for _, row in df.iterrows():
                path.append(row["Location"].strip())

            route_paths.append({
                "busNumber": str(sheet_name).strip(),
                "routeId": f"R{sheet_name}",
                "path": path
            })
        return route_paths
    except Exception as e:
        print(f"Error generating route paths: {e}")
        return []

def export_to_js(data, variable_name, output_file="extracted_data.js"):
    json_str = json.dumps(data, indent=2)
    with open(output_file, "a") as f:
        f.write(f"export const {variable_name} = {json_str};\n\n")

def main():
    excel_file = r"E:\Projects\Bus Opt\Final\bus_optimization_project\backend\cleaned_file.xlsx"

    if not os.path.exists(excel_file):
        print(f"Error: Excel file '{excel_file}' not found!")
        return

    if os.path.exists("extracted_data.js"):
        os.remove("extracted_data.js")

    print("Extracting Bus Strengths data...")
    bus_strengths = extract_bus_strengths(excel_file)
    export_to_js(bus_strengths, "busStrengths")

    print("Extracting Stop-wise Passenger Count data...")
    stopwise_data = extract_stopwise_passenger_count(excel_file)
    export_to_js(stopwise_data, "stopwisePassengerCount")

    print("Extracting Stop Locations data...")
    stop_locations = extract_stop_locations(excel_file)
    export_to_js(stop_locations, "stopLocations")

    print("Extracting Passenger data...")
    passengers = extract_passengers(excel_file)
    export_to_js(passengers, "passengers")

    print("Generating bus route paths...")
    bus_route_paths = generate_route_paths_from_locations(excel_file)
    export_to_js(bus_route_paths, "busRoutePaths")

    print("Data extraction complete. Results saved to 'extracted_data.js'")

if __name__ == "__main__":
    main()
