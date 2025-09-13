import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface StopLocation {
  latitude: number;
  longitude: number;
  name: string;
  departureTime?: string;
}

interface MapComponentProps {
  stops: StopLocation[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

// Component to fit map bounds to markers
const FitBounds = ({ stops }: { stops: StopLocation[] }) => {
  const map = useMap();

  useEffect(() => {
    if (stops.length > 0) {
      const bounds = L.latLngBounds(
        stops.map(stop => [stop.latitude, stop.longitude])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [stops, map]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ 
  stops, 
  center = [59.3293, 18.0686], // Stockholm coordinates as default
  zoom = 13,
  className = "h-64 w-full"
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <p className="text-gray-500">Laddar karta...</p>
      </div>
    );
  }

  if (stops.length === 0) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <p className="text-gray-500">Inga hållplatser att visa</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds stops={stops} />
        
        {stops.map((stop, index) => (
          <Marker
            key={index}
            position={[stop.latitude, stop.longitude]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm">{stop.name}</h3>
                {stop.departureTime && (
                  <p className="text-xs text-gray-600 mt-1">
                    Avgång: {stop.departureTime}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
