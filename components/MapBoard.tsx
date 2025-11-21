import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { RegionName, RegionState } from '../types';

interface MapBoardProps {
  playerRegionState: Record<RegionName, RegionState>;
  onSelectRegion: (region: RegionName) => void;
  selectedRegion: RegionName | null;
  playerColor: string;
}

const RegionMarker: React.FC<{
    region: RegionState;
    isSelected: boolean;
    playerColor: string;
    onSelect: (name: RegionName) => void;
}> = ({ region, isSelected, playerColor, onSelect }) => {
    const eventHandlers = useMemo(
        () => ({
            click() {
                onSelect(region.name);
            },
        }),
        [region.name, onSelect],
    );

    const radius = 20 + (region.marketShare / 2);

    return (
        <CircleMarker
            center={[region.lat, region.lng]}
            pathOptions={{
                color: isSelected ? '#ffffff' : playerColor,
                fillColor: playerColor,
                fillOpacity: isSelected ? 0.8 : 0.4,
                weight: isSelected ? 4 : 1,
            }}
            radius={radius}
            eventHandlers={eventHandlers}
        >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                <span className="font-bold text-xs">{region.name}</span>
            </Tooltip>
            <Popup>
                <div className="text-slate-900 min-w-[150px]">
                    <h3 className="font-bold text-lg">{region.name}</h3>
                    <div className="text-sm mt-2">
                        <p>Coverage: <b>{region.networkCoverage ? region.networkCoverage.toFixed(1) : 0}%</b></p>
                        <p>Market Share: <b>{region.marketShare ? region.marketShare.toFixed(1) : 0}%</b></p>
                        <p>Investments: {region.investments?.length || 0}</p>
                    </div>
                </div>
            </Popup>
        </CircleMarker>
    );
};

const MapBoard: React.FC<MapBoardProps> = ({ playerRegionState, onSelectRegion, selectedRegion, playerColor }) => {
  // Center of Indonesia
  const center: [number, number] = [-2.5489, 118.0149];

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-700 shadow-2xl relative z-0">
      <MapContainer 
        center={center} 
        zoom={5} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {Object.values(playerRegionState).map((region: RegionState) => (
            <RegionMarker
                key={region.name}
                region={region}
                isSelected={selectedRegion === region.name}
                playerColor={playerColor}
                onSelect={onSelectRegion}
            />
        ))}
      </MapContainer>
      
      <div className="absolute top-4 right-4 z-[500] bg-slate-900/90 p-3 rounded-lg border border-slate-600 text-xs max-w-[200px]">
        <h4 className="font-bold mb-1 text-slate-300">Map Legend</h4>
        <p className="text-slate-400 mb-1">Click circle to invest in region.</p>
        <p className="text-slate-400">Circle size represents current market presence.</p>
      </div>
    </div>
  );
};

export default MapBoard;