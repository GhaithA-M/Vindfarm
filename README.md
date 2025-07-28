# Vindfarm.dk - Danmarks Vindenergi Dashboard

A comprehensive dashboard for visualizing Denmark's wind turbine data, featuring interactive maps, analytics, and real-time filtering.

## Features

- **Interactive Map**: Dark mode map with wind turbine locations
- **Real-time Analytics**: Capacity distribution, manufacturer analysis, and offshore/onshore statistics
- **Advanced Filtering**: Filter by capacity, manufacturer, location type, and offshore areas
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Toggle between themes
- **Performance Optimized**: Defaults to offshore turbines for faster loading

## Data

The dashboard includes data for **5,683 wind turbines** across Denmark:
- **634 offshore turbines** (havmøller)
- **5,049 onshore turbines** (landmøller)
- **Total capacity**: 7,028.3 MW

## Deployment on GitHub Pages

### Prerequisites
- GitHub account
- Custom domain (optional, for vindfarm.dk)

### Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Set Custom Domain** (optional):
   - In the Pages settings, enter your domain (e.g., `vindfarm.dk`)
   - Update your DNS settings to point to GitHub Pages
   - The `CNAME` file is already included

4. **Update Data** (when needed):
   ```bash
   python scripts/create_github_pages_data.py
   git add data/consolidated_data.json
   git commit -m "Update turbine data"
   git push origin main
   ```

## Local Development

### Prerequisites
- Python 3.7+
- Required packages: `flask`, `waitress`

### Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the development server:
   ```bash
   python server.py
   ```

3. Open http://localhost:8080

## File Structure

```
Vindfarm/
├── index.html              # Main dashboard
├── static/
│   ├── css/style.css       # Styles
│   └── js/dashboard.js     # Dashboard logic
├── data/
│   ├── consolidated_data.json  # All turbine data (GitHub Pages)
│   └── communes/           # Individual commune data
├── scripts/
│   └── create_github_pages_data.py  # Data consolidation script
├── server.py               # Flask development server
└── CNAME                   # Custom domain configuration
```

## AdSense Integration

The dashboard includes Google AdSense support with conditional loading:
- Ads only display when available
- Responsive design for mobile devices
- Dark mode compatibility
- Non-intrusive placement

To enable ads:
1. Replace `YOUR_AD_SLOT_ID_HERE` in `index.html` with your actual ad slot IDs
2. Ensure your domain is approved by Google AdSense

## Performance Notes

- **Default loading**: Only offshore turbines (634) for faster initial load
- **On-demand loading**: Click "Tænd" button to load onshore turbines (5,049)
- **Optimized rendering**: Hardware-accelerated animations and efficient marker clustering

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## License

This project is for educational and informational purposes regarding Denmark's wind energy infrastructure. 