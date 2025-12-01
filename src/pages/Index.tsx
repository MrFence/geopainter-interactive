import { useEffect, useState } from "react";
import WorldMap from "@/components/WorldMap";
import { Globe } from "lucide-react";

const Index = () => {
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch world countries GeoJSON from Natural Earth data via CDN
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((response) => response.json())
      .then((data) => {
        // Convert TopoJSON to GeoJSON
        // For simplicity, we'll use a pre-converted GeoJSON source
        return fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson");
      })
      .then((response) => response.json())
      .then((geojson) => {
        setGeoData(geojson);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading map data:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Globe className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Interactive World Map</h1>
              <p className="text-sm text-muted-foreground">Click countries to highlight them</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
              <p className="text-muted-foreground">Loading world map...</p>
            </div>
          </div>
        ) : geoData ? (
          <div className="space-y-6">
            <div className="bg-card/30 border border-border rounded-lg p-4 backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-foreground">How to Use</h2>
                  <p className="text-sm text-muted-foreground">
                    Click any country to cycle through colors
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border border-border bg-map-default"></div>
                    <span className="text-muted-foreground">Default</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border border-border bg-map-yellow"></div>
                    <span className="text-muted-foreground">First Click</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border border-border bg-map-green"></div>
                    <span className="text-muted-foreground">Second Click</span>
                  </div>
                </div>
              </div>
            </div>
            <WorldMap data={geoData} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center space-y-4">
              <p className="text-destructive">Failed to load map data</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 text-center text-sm text-muted-foreground">
          Use mouse wheel or zoom controls to navigate • Drag to pan the map
        </div>
      </footer>
    </div>
  );
};

export default Index;
