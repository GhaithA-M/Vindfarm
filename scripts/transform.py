import os
import pandas as pd
import json
from pyproj import Transformer

# Initialize the UTM to WGS84 transformer
transformer = Transformer.from_crs("EPSG:25832", "EPSG:4326", always_xy=True)

# File paths
input_file = "D:/Dropbox/Github/Vindfarm/data/anlaeg.xlsx"
output_directory = "./data/communes"

# Ensure the output directory exists
os.makedirs(output_directory, exist_ok=True)

# Load and clean data
df = pd.read_excel(input_file, skiprows=10)  # Skips the irrelevant rows

# Ensure proper column mapping based on the data structure you provided
df = df.rename(columns={
    'Kommune': 'kommune',
    'X (øst) koordinat \nUTM 32 Euref89': 'x_coord',
    'Y (nord) koordinat \nUTM 32 Euref89': 'y_coord',
    'Kapacitet (kW)': 'capacity_kw',
    'Model': 'model',
    'Møllenummer (GSRN)': 'gsrn_number',
    'Dato for oprindelig nettilslutning': 'connection_date',
    'Rotor-diameter (m)': 'rotor_diameter_m',
    'Navhøjde (m)': 'hub_height_m',
    'Fabrikat': 'manufacturer',
    'Type af placering': 'placement_type',
    'Ejerlav': 'owner_area',
    'Matrikel-nummer': 'parcel_number',
    'Koordinatoprindelse': 'coordinate_origin',
    'Netselskabets installations-nummer': 'installation_number'
})

# Verify renamed columns
required_columns = ['x_coord', 'y_coord', 'kommune']
missing_columns = [col for col in required_columns if col not in df.columns]
if missing_columns:
    # Print available columns for debugging
    print(f"Available columns: {df.columns}")
    raise ValueError(f"Missing required columns after renaming: {missing_columns}")

# Remove rows with missing coordinates
df = df.dropna(subset=['x_coord', 'y_coord'])

# Transform and export data
for kommune, group in df.groupby("kommune"):
    json_data = []
    for _, row in group.iterrows():
        lon, lat = transformer.transform(row["x_coord"], row["y_coord"])
        json_data.append({
            "x_coord": lon,
            "y_coord": lat,
            "model": row.get("model", "Ukendt"),
            "capacity_kw": row.get("capacity_kw", "Ukendt"),
            "kommune": kommune,
            "gsrn_number": row.get("gsrn_number", "Ukendt"),
            "connection_date": row.get("connection_date", "Ukendt"),
            "rotor_diameter_m": row.get("rotor_diameter_m", "Ukendt"),
            "hub_height_m": row.get("hub_height_m", "Ukendt"),
            "manufacturer": row.get("manufacturer", "Ukendt"),
            "placement_type": row.get("placement_type", "Ukendt"),
            "owner_area": row.get("owner_area", "Ukendt"),
            "parcel_number": row.get("parcel_number", "Ukendt"),
            "coordinate_origin": row.get("coordinate_origin", "Ukendt"),
            "installation_number": row.get("installation_number", "Ukendt"),
        })

    output_path = os.path.join(output_directory, f"{kommune.lower().replace('ø', 'oe').replace('å', 'aa').replace('æ', 'ae')}.json")
    with open(output_path, "w", encoding="utf-8") as json_file:
        json.dump(json_data, json_file, indent=4, ensure_ascii=False)

print("Transformation complete. JSON files saved in:", output_directory)
