// Initialize the map
const map = L.map('map').setView([56, 10], 7); // Centered on Denmark

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Function to load turbine data from all kommunes
const loadTurbineData = async () => {
    const kommunes = [
        ""
    ];

    for (const kommune of kommunes) {
        const filePath = `/data/communes/${kommune}.json`;

        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            data.forEach(turbine => {
                const {
                    x_coord,
                    y_coord,
                    model,
                    capacity_kw,
                    kommune,
                    gsrn,
                    nettilslutning,
                    roter_diameter,
                    navhoejde,
                    fabrikat,
                    matrikel,
                    koordinatoprindelse
                } = turbine;

                // Add marker to map
                L.marker([y_coord, x_coord]).addTo(map)
                    .bindPopup(`
                        <b>Model:</b> ${model || '?'}<br>
                        <b>Kapacitet:</b> ${capacity_kw || '?'} kW<br>
                        <b>Kommune:</b> ${kommune || '?'}<br>
                        <b>GSRN:</b> ${gsrn || '?'}<br>
                        <b>Nettilslutning:</b> ${nettilslutning || '?'}<br>
                        <b>Rotor Diameter:</b> ${roter_diameter || '?'} m<br>
                        <b>Navhøjde:</b> ${navhoejde || '?'} m<br>
                        <b>Fabrikat:</b> ${fabrikat || '?'}<br>
                        <b>Matrikel:</b> ${matrikel || '?'}<br>
                        <b>Koordinatoprindelse:</b> ${koordinatoprindelse || '?'}
                    `);
            });

            console.log(`Loaded data for ${kommune}`);
        } catch (error) {
            console.error(`Failed to load data for ${kommune}:`, error);
        }
    }
};

// Call the function to load turbine data
loadTurbineData();
