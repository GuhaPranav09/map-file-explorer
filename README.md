# Interactive Map Application

A beautiful, interactive map application built with React, Leaflet, and OpenStreetMap - completely free and open source.

## Features

- 🗺️ **Interactive Map** - Explore the world with smooth pan and zoom controls
- 📍 **Custom Markers** - Click anywhere on the map to add markers
- 🔍 **Location Search** - Search for any location using the built-in geocoding
- 💾 **Saved Locations** - All your markers are saved locally and persist across sessions
- 🎨 **Multiple Map Styles** - Switch between Street, Satellite, Terrain, and Dark modes
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- ✨ **Modern UI** - Clean interface with glassmorphism effects and smooth animations

## Technologies Used

- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Leaflet** - Interactive maps library
- **OpenStreetMap** - Free map data
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool
- **shadcn/ui** - Beautiful component library

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the local development URL shown in the terminal.

## Usage

1. **Adding Markers** - Click anywhere on the map to add a marker
2. **Searching** - Use the search bar to find locations worldwide
3. **Saving Locations** - Your markers are automatically saved to local storage
4. **Removing Markers** - Click the trash icon next to any saved location
5. **Flying to Locations** - Click on saved locations to fly to them on the map
6. **Changing Map Style** - Use the style dropdown to switch between different map views

## Deployment

This project can be deployed to any static hosting service:

- **Lovable** - Click the Publish button in the Lovable editor
- **Vercel** - Connect your GitHub repo to Vercel
- **Netlify** - Drag and drop the `dist` folder after running `npm run build`
- **GitHub Pages** - Use GitHub Actions for automatic deployment

## Project Structure

```
src/
├── components/
│   ├── MapContainer.tsx    # Main map component
│   ├── NavLink.tsx         # Navigation helper
│   └── ui/                 # shadcn/ui components
├── pages/
│   ├── Index.tsx           # Home page
│   └── NotFound.tsx        # 404 page
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
└── index.css              # Global styles and design tokens
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Map data from [OpenStreetMap](https://www.openstreetmap.org/)
- Map library by [Leaflet](https://leafletjs.com/)
- Geocoding by [Nominatim](https://nominatim.org/)
- Built with [Lovable](https://lovable.dev/)
