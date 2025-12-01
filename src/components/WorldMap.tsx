import { useEffect, useRef, useState } from "react";
import { geoPath, geoMercator } from "d3-geo";
import { zoom, zoomIdentity } from "d3-zoom";
import { select } from "d3-selection";
import "d3-transition";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface CountryFeature {
  type: "Feature";
  properties: {
    name: string;
  };
  geometry: any;
  id: string;
}

interface WorldMapProps {
  data: {
    type: "FeatureCollection";
    features: CountryFeature[];
  };
}

type CountryState = "default" | "yellow" | "green";

const WorldMap = ({ data }: WorldMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [countryStates, setCountryStates] = useState<Record<string, CountryState>>({});
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null);
  const zoomBehaviorRef = useRef<any>(null);

  const width = 1200;
  const height = 700;

  const projection = geoMercator()
    .scale(180)
    .translate([width / 2, height / 1.5]);

  const pathGenerator = geoPath().projection(projection);

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = select(svgRef.current);
    const g = select(gRef.current);

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    return () => {
      svg.on(".zoom", null);
    };
  }, []);

  const handleCountryClick = (countryId: string) => {
    setCountryStates((prev) => {
      const current = prev[countryId] || "default";
      let next: CountryState;
      
      if (current === "default") {
        next = "yellow";
      } else if (current === "yellow") {
        next = "green";
      } else {
        next = "default";
      }
      
      return { ...prev, [countryId]: next };
    });
  };

  const getCountryFill = (countryId: string, isHovered: boolean) => {
    const state = countryStates[countryId] || "default";
    
    if (state === "yellow") return "hsl(var(--map-yellow))";
    if (state === "green") return "hsl(var(--map-green))";
    if (isHovered) return "hsl(var(--map-hover))";
    return "hsl(var(--map-default))";
  };

  const handleMouseMove = (event: React.MouseEvent, name: string) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        name,
      });
    }
  };

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      select(svgRef.current).transition().call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleReset = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      select(svgRef.current)
        .transition()
        .duration(750)
        .call(zoomBehaviorRef.current.transform, zoomIdentity);
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={handleZoomIn}
          className="shadow-lg"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleZoomOut}
          className="shadow-lg"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleReset}
          className="shadow-lg"
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="bg-background border border-border rounded-lg shadow-2xl"
      >
        <g ref={gRef}>
          {data.features.map((feature) => {
            const countryId = feature.id || feature.properties.name;
            const isHovered = hoveredCountry === countryId;
            
            return (
              <path
                key={countryId}
                d={pathGenerator(feature as any) || ""}
                fill={getCountryFill(countryId, isHovered)}
                stroke="hsl(var(--map-border))"
                strokeWidth={0.5}
                className="cursor-pointer transition-all duration-300 hover:stroke-2"
                onClick={() => handleCountryClick(countryId)}
                onMouseEnter={() => setHoveredCountry(countryId)}
                onMouseLeave={() => {
                  setHoveredCountry(null);
                  setTooltip(null);
                }}
                onMouseMove={(e) => handleMouseMove(e, feature.properties.name)}
              />
            );
          })}
        </g>
      </svg>

      {tooltip && (
        <div
          className="absolute pointer-events-none bg-card text-card-foreground px-3 py-2 rounded-md shadow-lg text-sm font-medium border border-border"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
          }}
        >
          {tooltip.name}
        </div>
      )}
    </div>
  );
};

export default WorldMap;
