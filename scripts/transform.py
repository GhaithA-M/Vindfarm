import pandas as pd
import os
import json
from pyproj import Proj, transform

# Define the projections
utm_proj = Proj(proj="utm", zone=32, datum="WGS84")  # UTM Zone 32
wgs84_proj = Proj(proj="latlong", datum="WGS84")  # WGS84

def load_excel(file_path):
    print("Loading Excel file...")
    # Skip initial rows to find the actual data headers
    df = pd.read_excel(file_path, header=9)  # Adjust header row if necessary
    print("Excel file loaded successfully.")
    return df

def prepare_dataframe(df):
    print("Renaming columns...")
    column_map = {
        'X (east) coordinate\nUTM 32 Euref89': 'x_coord',
        'Y (north) coordinate\nUTM 32 Euref89': 'y_coord',
        'Model': 'model',
        'Capacity (kW)': 'capacity_kw',
        'Local authority\nname': 'kommune',
        'Turbine identifier (GSRN)': 'gsrn',
        'Date of original connection to grid': 'connection_date',
        'Rotor diameter (m)': 'rotor_diameter',
        'Hub height (m)': 'hub_height',
        'Manufacture': 'manufacture',
        'Type of location': 'location_type',
        'Cadastral district': 'cadastral_district',
        'Cadastral no.': 'cadastral_no',
        'Origin of coordinates': 'coordinate_origin'
    }
    df = df.rename(columns=column_map)
    print(f"Columns after renaming: {df.columns.tolist()}")

    # Verify required columns
    required_columns = ['x_coord', 'y_coord', 'model', 'capacity_kw', 'kommune']
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")

    # Drop rows with missing coordinates or critical values
    df = df.dropna(subset=['x_coord', 'y_coord', 'capacity_kw'])

    # Convert numerical columns
    df['capacity_kw'] = pd.to_numeric(df['capacity_kw'], errors='coerce')
    df['x_coord'] = pd.to_numeric(df['x_coord'], errors='coerce')
    df['y_coord'] = pd.to_numeric(df['y_coord'], errors='coerce')

    # Convert datetime columns to string
    if 'connection_date' in df.columns:
        df['connection_date'] = pd.to_datetime(df['connection_date'], errors='coerce').dt.strftime('%Y-%m-%d')

    # Replace NaN values in non-critical fields with "N/A"
    non_critical_columns = [
        'gsrn', 'rotor_diameter', 'hub_height', 'manufacture',
        'location_type', 'cadastral_district', 'cadastral_no', 'coordinate_origin'
    ]
    for col in non_critical_columns:
        if col in df.columns:
            df[col] = df[col].fillna("N/A")

    return df

def transform_coordinates(utm_x, utm_y):
    try:
        lon, lat = transform(utm_proj, wgs84_proj, utm_x, utm_y)
        return lon, lat
    except Exception as e:
        print(f"Error transforming coordinates ({utm_x}, {utm_y}): {e}")
        return None, None

def export_json_files(df, output_directory):
    os.makedirs(output_directory, exist_ok=True)

    for kommune, group in df.groupby('kommune'):
        json_data = []
        for _, row in group.iterrows():
            lon, lat = transform_coordinates(row['x_coord'], row['y_coord'])
            if lon is not None and lat is not None:
                json_data.append({
                    "x_coord": lon,
                    "y_coord": lat,
                    "model": row['model'],
                    "capacity_kw": row['capacity_kw'],
                    "kommune": kommune,
                    "gsrn": row.get('gsrn', 'N/A'),
                    "connection_date": row.get('connection_date', 'N/A'),
                    "rotor_diameter": row.get('rotor_diameter', 'N/A'),
                    "hub_height": row.get('hub_height', 'N/A'),
                    "manufacture": row.get('manufacture', 'N/A'),
                    "location_type": row.get('location_type', 'N/A'),
                    "cadastral_district": row.get('cadastral_district', 'N/A'),
                    "cadastral_no": row.get('cadastral_no', 'N/A'),
                    "coordinate_origin": row.get('coordinate_origin', 'N/A')
                })
        filename = f"{kommune.lower().replace('ø', 'oe').replace('å', 'aa').replace('æ', 'ae')}.json"
        output_path = os.path.join(output_directory, filename)
        with open(output_path, 'w', encoding='utf-8') as json_file:
            json.dump(json_data, json_file, indent=4, ensure_ascii=False)
        print(f"Exported JSON for {kommune} to {output_path}")

def main():
    input_file = "data/anlaeg.xlsx"  # Ensure this file exists in the specified directory
    output_directory = "./data/communes"

    print("Loading Excel file...")
    df = load_excel(input_file)
    print("Preparing DataFrame...")
    df = prepare_dataframe(df)
    print("Exporting JSON files...")
    export_json_files(df, output_directory)
    print("All data successfully processed and exported.")

if __name__ == "__main__":
    main()
