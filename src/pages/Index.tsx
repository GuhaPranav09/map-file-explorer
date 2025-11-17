import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Map, Key } from 'lucide-react';
import MapContainer from '@/components/MapContainer';

const Index = () => {
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  const handleTokenSubmit = () => {
    if (tokenInput.trim()) {
      setMapboxToken(tokenInput.trim());
      setShowTokenInput(false);
    }
  };

  if (!mapboxToken || showTokenInput) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 shadow-elegant">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
              <Map className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Interactive Map Explorer
            </h1>
            <p className="text-muted-foreground">
              Enter your Mapbox token to get started
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Mapbox Access Token</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="pk.eyJ1..."
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTokenSubmit()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleTokenSubmit} className="shrink-0">
                  Start
                </Button>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
              <p className="font-medium">How to get your token:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Go to <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a></li>
                <li>Sign up or log in to your account</li>
                <li>Navigate to your account tokens</li>
                <li>Copy your default public token</li>
                <li>Paste it above and click Start</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return <MapContainer mapboxToken={mapboxToken} />;
};

export default Index;
