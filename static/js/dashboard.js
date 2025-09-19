// Global variables
let map;
let allTurbines = [];
let filteredTurbines = [];
let markers = [];
let markerGroups = {
    onshore: L.layerGroup(),
    offshore: L.layerGroup()
};
let charts = {};
let isDataLoaded = false;
let isDarkMode = true; // Start with dark mode
let darkTileLayer, lightTileLayer;
let isInitialLoad = true; // Track if this is the very first load

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode
    document.body.classList.add('dark-mode');
    
    // Initialize map
    initializeMap();
    initializeCharts();
    
    // Initialize AdSense ads with conditional loading
    initializeAds();
    
    // Load data
    loadConsolidatedData();
    
    // Event listeners
    setupEventListeners();
});

// Initialize AdSense ads with conditional loading
function initializeAds() {
    // Wait for AdSense to load
    if (typeof adsbygoogle !== 'undefined') {
        loadAdUnits();
    } else {
        // Wait for AdSense to load
        window.addEventListener('load', function() {
            if (typeof adsbygoogle !== 'undefined') {
                loadAdUnits();
            }
        });
    }
}

// Load individual ad units with error handling
function loadAdUnits() {
    const adContainers = [
        { id: 'top-ad-container', name: 'Top Banner' },
        { id: 'sidebar-ad-container', name: 'Sidebar' },
        { id: 'bottom-ad-container', name: 'Bottom Banner' }
    ];
    
    adContainers.forEach(container => {
        const element = document.getElementById(container.id);
        if (element) {
            try {
                // Show the container first
                element.style.display = 'block';
                
                // Push the ad
                (adsbygoogle = window.adsbygoogle || []).push({});
                
                // Check if ad loaded successfully after a delay
                setTimeout(() => {
                    const adElement = element.querySelector('ins.adsbygoogle');
                    if (adElement && adElement.innerHTML.trim() === '') {
                        // Ad didn't load, hide the container
                        element.style.display = 'none';
                        console.log(`${container.name} ad not available, hiding container`);
                    } else {
                        console.log(`${container.name} ad loaded successfully`);
                    }
                }, 3000); // Wait 3 seconds for ad to load
                
            } catch (error) {
                console.warn(`Error loading ${container.name} ad:`, error);
                element.style.display = 'none';
            }
        }
    });
}

// Handle ad visibility based on panel state
function updateAdVisibility() {
    const filtersPanel = document.getElementById('filters-panel');
    const chartsPanel = document.getElementById('charts-panel');
    const adContainers = document.querySelectorAll('.ad-container');
    
    // Check if any panels are open
    const hasOpenPanels = !filtersPanel.classList.contains('collapsed') || 
                         !chartsPanel.classList.contains('collapsed');
    
    adContainers.forEach(container => {
        if (container.style.display !== 'none') { // Only affect visible ads
            if (hasOpenPanels) {
                container.style.opacity = '0.3';
                container.style.pointerEvents = 'none';
            } else {
                container.style.opacity = '1';
                container.style.pointerEvents = 'auto';
            }
        }
    });
}

// Initialize the map
function initializeMap() {
    map = L.map('map').setView([56.2639, 9.5018], 7);
    
    // Create both tile layers
    darkTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    });
    
    lightTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    });
    
    // Start with dark mode
    darkTileLayer.addTo(map);
    
    // Add layer groups
    map.addLayer(markerGroups.onshore);
    map.addLayer(markerGroups.offshore);
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        map.removeLayer(lightTileLayer);
        map.addLayer(darkTileLayer);
        document.body.classList.add('dark-mode');
        document.getElementById('toggle-dark-mode').innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        map.removeLayer(darkTileLayer);
        map.addLayer(lightTileLayer);
        document.body.classList.remove('dark-mode');
        document.getElementById('toggle-dark-mode').innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Update chart colors for the new theme
    updateChartColors();
}

// Update chart colors based on current theme
function updateChartColors() {
    const textColor = isDarkMode ? '#ffffff' : '#2c3e50';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Update all charts
    Object.values(charts).forEach(chart => {
        if (chart && chart.options) {
            // Update scales
            if (chart.options.scales) {
                if (chart.options.scales.y) {
                    chart.options.scales.y.ticks.color = textColor;
                    chart.options.scales.y.grid.color = gridColor;
                }
                if (chart.options.scales.x) {
                    chart.options.scales.x.ticks.color = textColor;
                    chart.options.scales.x.grid.color = gridColor;
                }
            }
            
            // Update legend
            if (chart.options.plugins && chart.options.plugins.legend) {
                chart.options.plugins.legend.labels.color = textColor;
            }
            
            chart.update('none');
        }
    });
}

// Initialize charts with better dark mode colors and rounded corners
function initializeCharts() {
    // Capacity distribution chart
    const capacityCtx = document.getElementById('capacity-chart').getContext('2d');
    charts.capacity = new Chart(capacityCtx, {
        type: 'bar',
        data: {
            labels: ['0-1 MW', '1-2 MW', '2-3 MW', '3-4 MW', '4+ MW'],
            datasets: [{
                label: 'Antal Møller',
                data: [0, 0, 0, 0, 0],
                backgroundColor: isDarkMode ? '#3498db' : '#3498db',
                borderColor: isDarkMode ? '#2980b9' : '#2980b9',
                borderWidth: 1,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: isDarkMode ? '#ffffff' : '#2c3e50'
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: isDarkMode ? '#ffffff' : '#2c3e50'
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            animation: false
        }
    });

    // Location distribution chart
    const locationCtx = document.getElementById('location-chart').getContext('2d');
    charts.location = new Chart(locationCtx, {
        type: 'doughnut',
        data: {
            labels: ['Landmøller', 'Havmøller'],
            datasets: [{
                data: [0, 0],
                backgroundColor: isDarkMode ? ['#e74c3c', '#3498db'] : ['#e74c3c', '#3498db'],
                borderColor: isDarkMode ? ['#c0392b', '#2980b9'] : ['#c0392b', '#2980b9'],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: isDarkMode ? '#ffffff' : '#2c3e50',
                        padding: 10,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            animation: false
        }
    });

    // Manufacturer chart
    const manufacturerCtx = document.getElementById('manufacturer-chart').getContext('2d');
    charts.manufacturer = new Chart(manufacturerCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Antal Møller',
                data: [],
                backgroundColor: isDarkMode ? '#27ae60' : '#27ae60',
                borderColor: isDarkMode ? '#229954' : '#229954',
                borderWidth: 1,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: isDarkMode ? '#ffffff' : '#2c3e50'
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: isDarkMode ? '#ffffff' : '#2c3e50',
                        maxRotation: 45
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            animation: false
        }
    });
}

// Load data from individual files
async function loadConsolidatedData() {
    showLoading(true);
    console.log('Starting to load turbine data...');
    
    // Fallback to individual files (original method)
    try {
        // Load summary statistics first
        const summaryResponse = await fetch('/data/communes/summary_statistics.json');
        if (!summaryResponse.ok) {
            throw new Error('Summary statistics not available');
        }
        const summaryData = await summaryResponse.json();
        updateHeaderStats(summaryData);
        
        // Load all commune data
        const kommunes = [
            'aabenraa', 'aalborg', 'aarhus', 'aeroe', 'alleroed', 'assens', 'billund', 'bornholm', 
            'broendby', 'broenderslev', 'egedal', 'esbjerg', 'faaborg-midtfyn', 'fanoe', 'favrskov', 
            'faxe', 'fredericia', 'frederikshavn', 'frederikssund', 'greve', 'guldborgsund', 
            'haderslev', 'halsnaes', 'hedensted', 'helsingoer', 'herning', 'hilleroed', 'hjoerring', 
            'hoeje-taastrup', 'holbaek', 'holstebro', 'horsens', 'hvidovre', 'ikast-brande', 
            'ishoej', 'jammerbugt', 'kalundborg', 'kerteminde', 'koebenhavn', 'koege', 'kolding', 
            'kommune', 'laesoe', 'langeland', 'lejre', 'lemvig', 'lolland', 'osterild', 'vesthimmerlands', 
            'viborg', 'vordingborg'
        ];
        
        allTurbines = [];
        let loadedCount = 0;
        
        for (const kommune of kommunes) {
            try {
                const response = await fetch(`/data/communes/${kommune}.json`);
                if (response.ok) {
                    const data = await response.json();
                    allTurbines = allTurbines.concat(data);
                    loadedCount++;
                    console.log(`Loaded ${data.length} turbines from ${kommune}`);
                } else {
                    console.warn(`Failed to load ${kommune}: ${response.status}`);
                }
            } catch (error) {
                console.warn(`Error loading ${kommune}:`, error);
            }
        }
        
        console.log(`Total turbines loaded: ${allTurbines.length} from ${loadedCount} communes`);
        
        if (allTurbines.length === 0) {
            throw new Error('No turbine data loaded');
        }
        
        filteredTurbines = [...allTurbines];
        
        // Ensure initial state is set correctly
        if (isInitialLoad) {
            // Use setTimeout to ensure DOM is fully ready
            setTimeout(() => {
                const offshoreBtn = document.getElementById('toggle-offshore');
                const onshoreBtn = document.getElementById('toggle-onshore');
                
                // Set initial button states
                if (offshoreBtn) {
                    offshoreBtn.classList.add('active');
                    updateButtonText(offshoreBtn, true);
                }
                if (onshoreBtn) {
                    onshoreBtn.classList.remove('active');
                    updateButtonText(onshoreBtn, false);
                }
                
                // Call displayTurbines after setting initial state
                displayTurbines();
            }, 100);
        } else {
            displayTurbines();
        }
        updateCharts();
        populateFilters();
        isDataLoaded = true;
        showLoading(false);
        
        // Final check: ensure visibility state is correct
        if (isInitialLoad) {
            setTimeout(() => {
                const offshoreBtn = document.getElementById('toggle-offshore');
                const onshoreBtn = document.getElementById('toggle-onshore');
                
                if (offshoreBtn && onshoreBtn) {
                    // Double-check that the initial state is correct
                    if (!offshoreBtn.classList.contains('user-interacted') && 
                        !onshoreBtn.classList.contains('user-interacted')) {
                        
                        offshoreBtn.classList.add('active');
                        onshoreBtn.classList.remove('active');
                        updateButtonText(offshoreBtn, true);
                        updateButtonText(onshoreBtn, false);
                        
                        // Ensure map layers match
                        map.addLayer(markerGroups.offshore);
                        map.removeLayer(markerGroups.onshore);
                    }
                }
            }, 200);
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
        showLoading(false);
        
        // Show error message to user
        const loadingElement = document.querySelector('.loading-message');
        if (loadingElement) {
            loadingElement.innerHTML = `
                <p>Fejl ved indlæsning af data</p>
                <p style="font-size: 12px; color: #999;">Kunne ikke indlæse vindmølledata. Prøv at genindlæse siden.</p>
            `;
        }
    }
}

// Update header statistics
function updateHeaderStats(summaryData) {
    document.getElementById('total-turbines').textContent = summaryData.total_turbines.toLocaleString();
    document.getElementById('total-capacity').textContent = Math.round(summaryData.total_capacity_mw).toLocaleString();
    document.getElementById('offshore-turbines').textContent = summaryData.offshore_turbines.toLocaleString();
}

// Display turbines on map with preserved visibility preferences
function displayTurbines() {
    markerGroups.onshore.clearLayers();
    markerGroups.offshore.clearLayers();
    markers = [];
    
    const onshoreMarkers = [];
    const offshoreMarkers = [];
    
    filteredTurbines.forEach(turbine => {
        const capacity = turbine.capacity_kw / 1000;
        const iconSize = Math.max(6, Math.min(16, capacity * 1.5));
        const iconColor = turbine.is_offshore ? '#3498db' : '#e74c3c';
        
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="width: ${iconSize}px; height: ${iconSize}px; background-color: ${iconColor}; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
            iconSize: [iconSize, iconSize],
            iconAnchor: [iconSize/2, iconSize/2]
        });
        
        const marker = L.marker([turbine.y_coord, turbine.x_coord], { icon: customIcon })
                        .bindPopup(createPopupContent(turbine))
                        .on('click', () => showTurbineDetails(turbine));
        
        if (turbine.is_offshore) {
            offshoreMarkers.push(marker);
        } else {
            onshoreMarkers.push(marker);
        }
    });
    
    // Add markers to groups
    offshoreMarkers.forEach(marker => markerGroups.offshore.addLayer(marker));
    onshoreMarkers.forEach(marker => markerGroups.onshore.addLayer(marker));
    markers = [...offshoreMarkers, ...onshoreMarkers];
    
    // Get button references
    const offshoreBtn = document.getElementById('toggle-offshore');
    const onshoreBtn = document.getElementById('toggle-onshore');
    
    // Safety check: if buttons don't exist yet, just show all turbines
    if (!offshoreBtn || !onshoreBtn) {
        map.addLayer(markerGroups.offshore);
        map.addLayer(markerGroups.onshore);
        return;
    }
    
    // Check if this is the initial load or if user has interacted
    const hasUserInteracted = offshoreBtn.classList.contains('user-interacted') || 
                             onshoreBtn.classList.contains('user-interacted');
    
    if (isInitialLoad && !hasUserInteracted) {
        // Very first load: show only offshore turbines for better performance
        map.addLayer(markerGroups.offshore);
        map.removeLayer(markerGroups.onshore);
        
        // Ensure button states match the default behavior
        if (offshoreBtn) {
            offshoreBtn.classList.add('active');
            updateButtonText(offshoreBtn, true);
        }
        
        if (onshoreBtn) {
            onshoreBtn.classList.remove('active');
            updateButtonText(onshoreBtn, false);
        }
        
        // Mark that initial load is complete
        isInitialLoad = false;
    } else {
        // Either not initial load or user has interacted: preserve current visibility state
        const offshoreActive = offshoreBtn && offshoreBtn.classList.contains('active');
        const onshoreActive = onshoreBtn && onshoreBtn.classList.contains('active');
        
        if (offshoreActive) {
            map.addLayer(markerGroups.offshore);
        } else {
            map.removeLayer(markerGroups.offshore);
        }
        
        if (onshoreActive) {
            map.addLayer(markerGroups.onshore);
        } else {
            map.removeLayer(markerGroups.onshore);
        }
    }
}

// Create popup content
function createPopupContent(turbine) {
    const capacity = (turbine.capacity_kw / 1000).toFixed(1);
    const isOffshore = turbine.is_offshore;
    
    return `
        <div style="min-width: 200px;">
            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">
                ${turbine.model || 'Ukendt Model'}
                <span style="color: ${isOffshore ? '#3498db' : '#e74c3c'}; font-size: 12px;">(${isOffshore ? 'Havmølle' : 'Landmølle'})</span>
            </h4>
            <div style="font-size: 13px; line-height: 1.4;">
                <div><strong>Kapacitet:</strong> ${capacity} MW</div>
                <div><strong>Placering:</strong> ${turbine.kommune}</div>
                <div><strong>Type:</strong> ${isOffshore ? 'Havmølle' : 'Landmølle'}</div>
                ${turbine.manufacture !== 'N/A' ? `<div><strong>Fabrikat:</strong> ${turbine.manufacture}</div>` : ''}
                ${turbine.connection_date !== 'N/A' ? `<div><strong>Tilsluttet:</strong> ${turbine.connection_date}</div>` : ''}
                ${turbine.rotor_diameter !== 'N/A' ? `<div><strong>Rotor:</strong> ${turbine.rotor_diameter}m</div>` : ''}
                ${turbine.hub_height !== 'N/A' ? `<div><strong>Navhøjde:</strong> ${turbine.hub_height}m</div>` : ''}
            </div>
        </div>
    `;
}

// Show turbine details in overlay panel
function showTurbineDetails(turbine) {
    const detailsContainer = document.getElementById('turbine-details');
    const capacity = (turbine.capacity_kw / 1000).toFixed(1);
    
    detailsContainer.innerHTML = `
        <div class="turbine-info show">
            <h4>${turbine.model || 'Ukendt Model'}</h4>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Kapacitet:</span>
                    <span class="info-value">${capacity} MW</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Placering:</span>
                    <span class="info-value">${turbine.kommune}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Type:</span>
                    <span class="info-value">${turbine.is_offshore ? 'Havmølle' : 'Landmølle'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fabrikat:</span>
                    <span class="info-value">${turbine.manufacture !== 'N/A' ? turbine.manufacture : 'Ukendt'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tilslutningsdato:</span>
                    <span class="info-value">${turbine.connection_date !== 'N/A' ? turbine.connection_date : 'Ukendt'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">GSRN:</span>
                    <span class="info-value">${turbine.gsrn !== 'N/A' ? turbine.gsrn : 'Ukendt'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Rotordiameter:</span>
                    <span class="info-value">${turbine.rotor_diameter !== 'N/A' ? turbine.rotor_diameter + 'm' : 'Ukendt'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Navhøjde:</span>
                    <span class="info-value">${turbine.hub_height !== 'N/A' ? turbine.hub_height + 'm' : 'Ukendt'}</span>
                </div>
                ${turbine.is_offshore ? `
                <div class="info-item">
                    <span class="info-label">Havområde:</span>
                    <span class="info-value">${turbine.offshore_area || 'Ukendt'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sikkerhed:</span>
                    <span class="info-value">${turbine.offshore_confidence || 'Ukendt'}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Show the details panel
    const detailsPanel = document.getElementById('details-panel');
    detailsPanel.classList.add('show');
}

// Toggle panel visibility
function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    panel.classList.toggle('collapsed');
    
    // Special handling for details panel
    if (panelId === 'details-panel') {
        if (panel.classList.contains('collapsed')) {
            panel.classList.remove('show');
        }
    }
    
    // Trigger map resize to ensure proper rendering
    setTimeout(() => {
        map.invalidateSize();
    }, 300);

    // Update ad visibility after panel toggle
    updateAdVisibility();
}

// Update charts with current data
function updateCharts() {
    // Capacity distribution
    const capacityRanges = [0, 1, 2, 3, 4, Infinity];
    const capacityData = new Array(capacityRanges.length - 1).fill(0);
    
    filteredTurbines.forEach(turbine => {
        const capacity = turbine.capacity_kw / 1000;
        for (let i = 0; i < capacityRanges.length - 1; i++) {
            if (capacity >= capacityRanges[i] && capacity < capacityRanges[i + 1]) {
                capacityData[i]++;
                break;
            }
        }
    });
    
    charts.capacity.data.datasets[0].data = capacityData;
    charts.capacity.update('none'); // Disable animations for better performance
    
    // Location type distribution
    const onshoreCount = filteredTurbines.filter(t => !t.is_offshore).length;
    const offshoreCount = filteredTurbines.filter(t => t.is_offshore).length;
    
    charts.location.data.datasets[0].data = [onshoreCount, offshoreCount];
    charts.location.update('none');
    
    // Manufacturer distribution (top 10)
    const manufacturerCounts = {};
    filteredTurbines.forEach(turbine => {
        const manufacturer = turbine.manufacture !== 'N/A' ? turbine.manufacture : 'Ukendt';
        manufacturerCounts[manufacturer] = (manufacturerCounts[manufacturer] || 0) + 1;
    });
    
    const topManufacturers = Object.entries(manufacturerCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    charts.manufacturer.data.labels = topManufacturers.map(([name]) => name);
    charts.manufacturer.data.datasets[0].data = topManufacturers.map(([,count]) => count);
    charts.manufacturer.update('none');
}

// Populate filter options
function populateFilters() {
    // Get unique manufacturers
    const manufacturers = [...new Set(allTurbines.map(t => t.manufacture).filter(m => m !== 'N/A'))];
    const manufacturerSelect = document.getElementById('manufacturer-filter');
    
    // Clear existing options except "All"
    manufacturerSelect.innerHTML = '<option value="all">Alle Fabrikater</option>';
    
    // Add manufacturer options
    manufacturers.forEach(manufacturer => {
        const option = document.createElement('option');
        option.value = manufacturer;
        option.textContent = manufacturer;
        manufacturerSelect.appendChild(option);
    });
    
    // Get unique offshore areas
    const offshoreAreas = [...new Set(allTurbines.map(t => t.offshore_area).filter(a => a && a !== 'Onshore'))];
    const offshoreAreaSelect = document.getElementById('offshore-area-filter');
    
    // Clear existing options except "All"
    offshoreAreaSelect.innerHTML = '<option value="all">Alle Områder</option>';
    
    // Add offshore area options
    offshoreAreas.forEach(area => {
        const option = document.createElement('option');
        option.value = area;
        option.textContent = area === 'North Sea' ? 'Nordsøen' : 
                           area === 'Baltic Sea' ? 'Østersøen' : area;
        offshoreAreaSelect.appendChild(option);
    });
}

// Apply filters
function applyFilters() {
    const minCapacity = parseFloat(document.getElementById('min-capacity').value) || 0;
    const maxCapacity = parseFloat(document.getElementById('max-capacity').value) || Infinity;
    const manufacturer = document.getElementById('manufacturer-filter').value;
    const offshoreArea = document.getElementById('offshore-area-filter').value;
    
    filteredTurbines = allTurbines.filter(turbine => {
        const capacity = turbine.capacity_kw / 1000;
        const capacityMatch = capacity >= minCapacity && capacity <= maxCapacity;
        
        const manufacturerMatch = manufacturer === 'all' || turbine.manufacture === manufacturer;
        
        const offshoreAreaMatch = offshoreArea === 'all' || turbine.offshore_area === offshoreArea;
        
        return capacityMatch && manufacturerMatch && offshoreAreaMatch;
    });
    
    displayTurbines();
    updateCharts();
}

// Reset filters
function resetFilters() {
    document.getElementById('location-filter').value = 'all';
    document.getElementById('min-capacity').value = '';
    document.getElementById('max-capacity').value = '';
    document.getElementById('manufacturer-filter').value = 'all';
    document.getElementById('offshore-area-filter').value = 'all';
    
    filteredTurbines = [...allTurbines];
    displayTurbines();
    updateCharts();
}

// Update button text based on state
function updateButtonText(button, isActive) {
    const textSpan = button.querySelector('.btn-text');
    if (textSpan) {
        textSpan.textContent = isActive ? 'Sluk' : 'Tænd';
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    
    // Real-time filtering event listeners
    document.getElementById('min-capacity').addEventListener('input', applyFilters);
    document.getElementById('max-capacity').addEventListener('input', applyFilters);
    document.getElementById('manufacturer-filter').addEventListener('change', applyFilters);
    document.getElementById('offshore-area-filter').addEventListener('change', applyFilters);
    
    // Header controls
    document.getElementById('toggle-offshore').addEventListener('click', function() {
        this.classList.toggle('active');
        this.classList.add('user-interacted'); // Mark as user-interacted
        const isActive = this.classList.contains('active');
        updateButtonText(this, isActive);
        
        if (isActive) {
            map.addLayer(markerGroups.offshore);
        } else {
            map.removeLayer(markerGroups.offshore);
        }
    });
    
    document.getElementById('toggle-onshore').addEventListener('click', function() {
        this.classList.toggle('active');
        this.classList.add('user-interacted'); // Mark as user-interacted
        const isActive = this.classList.contains('active');
        updateButtonText(this, isActive);
        
        if (isActive) {
            map.addLayer(markerGroups.onshore);
        } else {
            map.removeLayer(markerGroups.onshore);
        }
    });

    document.getElementById('toggle-dark-mode').addEventListener('click', toggleDarkMode);
    
    // Map control event listeners
    document.getElementById('toggle-filters').addEventListener('click', function() {
        togglePanel('filters-panel');
    });
    
    document.getElementById('toggle-charts').addEventListener('click', function() {
        togglePanel('charts-panel');
    });
    
    document.getElementById('reset-map').addEventListener('click', function() {
        map.setView([56.2639, 9.5018], 7);
    });
    
    // Close details panel when clicking outside
    document.addEventListener('click', function(event) {
        const detailsPanel = document.getElementById('details-panel');
        const detailsContent = document.getElementById('turbine-details');
        
        if (detailsPanel.classList.contains('show') && 
            !detailsPanel.contains(event.target) && 
            !event.target.closest('.leaflet-popup')) {
            detailsPanel.classList.remove('show');
        }
    });

    // Update ad visibility on initial load and panel changes
    updateAdVisibility();
}

// Show/hide loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
} 