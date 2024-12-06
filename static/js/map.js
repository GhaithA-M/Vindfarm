// Initialize the map
const map = L.map('map').setView([56, 10], 7);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load turbine data
const loadTurbineData = async () => {
    const kommunes = [
        "broenderslev", "aalborg", "aabenraa", "assens", "bornholm"
    ]; // Add more as needed

    for (const kommune of kommunes) {
        const filePath = `/data/communes/${kommune}.json`;

        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            data.forEach(turbine => {
                const { x_coord, y_coord, model, capacity_kw, kommune, gsrn_number, connection_date, rotor_diameter_m, hub_height_m, manufacturer, placement_type, owner_area, parcel_number, coordinate_origin, installation_number } = turbine;

                // Add marker
                L.marker([y_coord, x_coord]).addTo(map)
                    .bindPopup(`
                        <b>Model:</b> ${model || "Ukendt"}<br>
                        <b>Kapacitet:</b> ${capacity_kw} kW<br>
                        <b>Kommune:</b> ${kommune}<br>
                        <b>Nettilslutning:</b> ${connection_date || "Ukendt"}<br>
                        <b>Rotor diameter:</b> ${rotor_diameter_m || "Ukendt"} m<br>
                        <b>Navhøjde:</b> ${hub_height_m || "Ukendt"} m<br>
                        <b>Fabrikat:</b> ${manufacturer || "Ukendt"}<br>
                        <b>Placeringstype:</b> ${placement_type || "Ukendt"}<br>
                        <b>Ejerlav:</b> ${owner_area || "Ukendt"}<br>
                        <b>Matrikel:</b> ${parcel_number || "Ukendt"}<br>
                        <b>Koordinatoprindelse:</b> ${coordinate_origin || "Ukendt"}<br>
                        <b>Installationsnummer:</b> ${installation_number || "Ukendt"}<br>
                    `);
            });

            console.log(`Loaded data for ${kommune}`);
        } catch (error) {
            console.error(`Failed to load data for ${kommune}:`, error);
        }
    }
};

loadTurbineData();
