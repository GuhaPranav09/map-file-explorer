import { useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Search, Trash2, Map as MapIcon, Satellite, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MarkerData {
  id: string;
  name: string;
  coordinates: [number, number];
}

interface MapStyle {
  name: string;
  url: string;
  attribution: string;
  icon: any;
}

const mapStyles: Record<string, MapStyle> = {
  streets: {
    name: 'Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    icon: MapIcon,
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
    icon: Satellite,
  },
  dark: {
    name: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    icon: Moon,
  },
  light: {
    name: 'Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    icon: Sun,
  },
};

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const MapContainer = () => {
  const [savedMarkers, setSavedMarkers] = useState<MarkerData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapStyle, setMapStyle] = useState<keyof typeof mapStyles>('streets');
  const [map, setMap] = useState<L.Map | null>(null);

  const addMarker = (lat: number, lng: number, name: string) => {
    const id = Date.now().toString();
    const newMarker: MarkerData = { 
      id, 
      name, 
      coordinates: [lat, lng] 
    };
    
    setSavedMarkers((prev) => [...prev, newMarker]);
    toast.success(`Added ${name}`);
  };

  const handleMapClick = (lat: number, lng: number) => {
    addMarker(lat, lng, `Location ${savedMarkers.length + 1}`);
  };

  const removeMarker = (id: string) => {
    setSavedMarkers((prev) => prev.filter((m) => m.id !== id));
    toast.success('Marker removed');
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        
        map?.flyTo([latitude, longitude], 13, {
          duration: 2,
        });
        
        addMarker(latitude, longitude, display_name);
        setSearchQuery('');
      } else {
        toast.error('Location not found');
      }
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const flyToMarker = (coordinates: [number, number]) => {
    map?.flyTo(coordinates, 14, {
      duration: 1.5,
    });
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Interactive Map
          </h1>
          <p className="text-sm text-muted-foreground">Explore and save locations</p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Search for a place..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
              className="flex-1"
            />
            <Button onClick={searchLocation} size="icon" className="shrink-0">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Map Style Selector */}
        <div className="p-4 border-b border-border">
          <p className="text-sm font-medium mb-2">Map Style</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(mapStyles) as Array<keyof typeof mapStyles>).map((style) => {
              const Icon = mapStyles[style].icon;
              return (
                <Button
                  key={style}
                  variant={mapStyle === style ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMapStyle(style)}
                  className="capitalize"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {mapStyles[style].name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Saved Locations */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Saved Locations ({savedMarkers.length})</h2>
          </div>
          <div className="space-y-2">
            {savedMarkers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Click on the map to add markers
              </p>
            ) : (
              savedMarkers.map((marker) => (
                <Card
                  key={marker.id}
                  className="p-3 cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                  onClick={() => flyToMarker(marker.coordinates)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{marker.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {marker.coordinates[0].toFixed(4)}°, {marker.coordinates[1].toFixed(4)}°
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMarker(marker.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <LeafletMap
          center={[20, 0]}
          zoom={2}
          className="h-full w-full"
          ref={setMap}
        >
          <TileLayer
            url={mapStyles[mapStyle].url}
            attribution={mapStyles[mapStyle].attribution}
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {savedMarkers.map((marker) => (
            <Marker key={marker.id} position={marker.coordinates}>
              <Popup>
                <div className="p-1">
                  <h3 className="font-semibold text-sm">{marker.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {marker.coordinates[0].toFixed(4)}°, {marker.coordinates[1].toFixed(4)}°
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </LeafletMap>
        
        {/* Info overlay */}
        <div className="absolute top-4 left-4 right-4 pointer-events-none z-[1000]">
          <Card className="p-3 bg-card/90 backdrop-blur-sm border-border/50 pointer-events-auto">
            <p className="text-xs text-muted-foreground">
              💡 Click anywhere on the map to add a marker • Search for locations • Explore different map styles • 100% Free!
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;
