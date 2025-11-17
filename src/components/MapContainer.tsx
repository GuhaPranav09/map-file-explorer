import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Search, Trash2, Globe, Map as MapIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Marker {
  id: string;
  name: string;
  coordinates: [number, number];
}

interface MapContainerProps {
  mapboxToken: string;
}

const MapContainer = ({ mapboxToken }: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  
  const [savedMarkers, setSavedMarkers] = useState<Marker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark' | 'light'>('streets');

  const mapStyles = {
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
    dark: 'mapbox://styles/mapbox/dark-v11',
    light: 'mapbox://styles/mapbox/light-v11',
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyles[mapStyle],
      projection: 'globe',
      zoom: 2,
      center: [0, 20],
      pitch: 0,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6,
      });
    });

    // Add click handler to add markers
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      addMarker([lng, lat], `Location ${savedMarkers.length + 1}`);
    });

    // Restore saved markers
    savedMarkers.forEach((marker) => {
      createMarkerElement(marker.id, marker.coordinates, marker.name);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, mapStyle]);

  const createMarkerElement = (id: string, coordinates: [number, number], name: string) => {
    if (!map.current) return;

    const el = document.createElement('div');
    el.className = 'marker';
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.cursor = 'pointer';
    el.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="hsl(200 95% 45%)" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="9" r="2.5" fill="white"/>
      </svg>
    `;

    const marker = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="padding: 8px; font-family: system-ui;">
            <h3 style="margin: 0 0 4px; font-weight: 600;">${name}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              ${coordinates[1].toFixed(4)}°, ${coordinates[0].toFixed(4)}°
            </p>
          </div>`
        )
      )
      .addTo(map.current);

    markers.current[id] = marker;
  };

  const addMarker = (coordinates: [number, number], name: string) => {
    const id = Date.now().toString();
    const newMarker: Marker = { id, name, coordinates };
    
    setSavedMarkers((prev) => [...prev, newMarker]);
    createMarkerElement(id, coordinates, name);
    toast.success(`Added ${name}`);
  };

  const removeMarker = (id: string) => {
    if (markers.current[id]) {
      markers.current[id].remove();
      delete markers.current[id];
    }
    setSavedMarkers((prev) => prev.filter((m) => m.id !== id));
    toast.success('Marker removed');
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${mapboxToken}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        map.current?.flyTo({
          center: [lng, lat],
          zoom: 12,
          duration: 2000,
        });
        addMarker([lng, lat], data.features[0].place_name);
        setSearchQuery('');
      } else {
        toast.error('Location not found');
      }
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const flyToMarker = (coordinates: [number, number]) => {
    map.current?.flyTo({
      center: coordinates,
      zoom: 14,
      duration: 1500,
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
            {(['streets', 'satellite', 'dark', 'light'] as const).map((style) => (
              <Button
                key={style}
                variant={mapStyle === style ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMapStyle(style)}
                className="capitalize"
              >
                {style === 'streets' && <MapIcon className="h-3 w-3 mr-1" />}
                {style === 'satellite' && <Globe className="h-3 w-3 mr-1" />}
                {style}
              </Button>
            ))}
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
                          {marker.coordinates[1].toFixed(4)}°, {marker.coordinates[0].toFixed(4)}°
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
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Info overlay */}
        <div className="absolute top-4 left-4 right-4 pointer-events-none">
          <Card className="p-3 bg-card/90 backdrop-blur-sm border-border/50 pointer-events-auto">
            <p className="text-xs text-muted-foreground">
              💡 Click anywhere on the map to add a marker • Search for locations • Explore different map styles
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;
