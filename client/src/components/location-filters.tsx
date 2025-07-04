import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  getRegions, 
  getCitiesByRegion, 
  getNeighborhoodsByCity,
  type Region,
  type City,
  type Neighborhood
} from "@shared/locations";

interface LocationFiltersProps {
  selectedRegion: string | null;
  selectedCity: string | null;
  selectedNeighborhood: string | null;
  onRegionChange: (regionId: string | null) => void;
  onCityChange: (cityId: string | null) => void;
  onNeighborhoodChange: (neighborhoodId: string | null) => void;
  onMapMove?: (lat: number, lng: number, zoom: number) => void;
}

export function LocationFilters({
  selectedRegion,
  selectedCity,
  selectedNeighborhood,
  onRegionChange,
  onCityChange,
  onNeighborhoodChange,
  onMapMove,
}: LocationFiltersProps) {
  const [regions] = useState<Region[]>(getRegions());
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);

  // Update cities when region changes
  useEffect(() => {
    if (selectedRegion) {
      const regionCities = getCitiesByRegion(selectedRegion);
      setCities(regionCities);
      
      // Reset city and neighborhood if current city is not in new region
      if (selectedCity && !regionCities.find(c => c.id === selectedCity)) {
        onCityChange(null);
        onNeighborhoodChange(null);
      }
    } else {
      setCities([]);
      onCityChange(null);
      onNeighborhoodChange(null);
    }
  }, [selectedRegion, selectedCity, onCityChange, onNeighborhoodChange]);

  // Update neighborhoods when city changes
  useEffect(() => {
    if (selectedCity) {
      const cityNeighborhoods = getNeighborhoodsByCity(selectedCity);
      setNeighborhoods(cityNeighborhoods);
      
      // Reset neighborhood if current neighborhood is not in new city
      if (selectedNeighborhood && !cityNeighborhoods.find(n => n.id === selectedNeighborhood)) {
        onNeighborhoodChange(null);
      }
    } else {
      setNeighborhoods([]);
      onNeighborhoodChange(null);
    }
  }, [selectedCity, selectedNeighborhood, onNeighborhoodChange]);

  const handleRegionChange = (value: string) => {
    if (value === "all") {
      onRegionChange(null);
      // Show full Saudi Arabia map view
      onMapMove?.(24.0, 45.0, 6);
    } else {
      onRegionChange(value);
      // Move map to selected region
      const region = regions.find(r => r.id === value);
      if (region && onMapMove) {
        onMapMove(region.coordinates.lat, region.coordinates.lng, region.coordinates.zoom);
      }
    }
  };

  const handleCityChange = (value: string) => {
    if (value === "all") {
      onCityChange(null);
    } else {
      onCityChange(value);
    }
  };

  const handleNeighborhoodChange = (value: string) => {
    if (value === "all") {
      onNeighborhoodChange(null);
    } else {
      onNeighborhoodChange(value);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Region Filter */}
      <div className="min-w-[140px]">
        <Select value={selectedRegion || "all"} onValueChange={handleRegionChange}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="المنطقة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المناطق</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City Filter */}
      <div className="min-w-[120px]">
        <Select 
          value={selectedCity || "all"} 
          onValueChange={handleCityChange}
          disabled={!selectedRegion}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="المدينة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المدن</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Neighborhood Filter */}
      <div className="min-w-[120px]">
        <Select 
          value={selectedNeighborhood || "all"} 
          onValueChange={handleNeighborhoodChange}
          disabled={!selectedCity}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="الحي" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأحياء</SelectItem>
            {neighborhoods.map((neighborhood) => (
              <SelectItem key={neighborhood.id} value={neighborhood.id}>
                {neighborhood.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters Button */}
      {(selectedRegion || selectedCity || selectedNeighborhood) && (
        <button
          onClick={() => {
            onRegionChange(null);
            onCityChange(null);
            onNeighborhoodChange(null);
          }}
          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <i className="fas fa-times ml-1"></i>
          مسح
        </button>
      )}
    </div>
  );
}