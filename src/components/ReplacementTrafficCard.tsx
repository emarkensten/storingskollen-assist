import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Bus, Car, Eye, EyeOff } from 'lucide-react';
import { ReplacementTraffic } from '@/lib/trafikverket-api';
import MapComponent from './MapComponent';

interface ReplacementTrafficCardProps {
  replacement: ReplacementTraffic;
}

const ReplacementTrafficCard = ({ replacement }: ReplacementTrafficCardProps) => {
  const [showMap, setShowMap] = useState(false);
  const getVehicleIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'bus':
        return <Bus className="h-4 w-4" />;
      case 'taxi':
        return <Car className="h-4 w-4" />;
      default:
        return <Bus className="h-4 w-4" />;
    }
  };

  const getVehicleModeText = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'bus':
        return 'Ersättningsbuss';
      case 'taxi':
        return 'Ersättningstaxi';
      default:
        return 'Ersättningsfordon';
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Se stationsinformation';
    const date = new Date(dateString);
    return date.toLocaleTimeString('sv-SE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="w-full border-l-4 border-l-blue-500 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getVehicleIcon(replacement.VehicleMode)}
          {getVehicleModeText(replacement.VehicleMode)}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {replacement.ReplacesTrains?.ReplacesTrain?.[0]?.AdvertisedTrainIdent 
              ? `Ersätter tåg ${replacement.ReplacesTrains.ReplacesTrain[0].AdvertisedTrainIdent}`
              : 'Ersättningstrafik'
            }
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Vehicle Description */}
        {replacement.Description && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Beskrivning:</p>
              <p className="text-sm text-muted-foreground">{replacement.Description}</p>
            </div>
          </div>
        )}

        {/* Vehicle Identifier */}
        {replacement.VehicleIdentifier && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {replacement.VehicleIdentifier}
            </Badge>
          </div>
        )}

        {/* Status */}
        {replacement.Status && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Status: {replacement.Status}
            </Badge>
          </div>
        )}

        {/* Stops Information */}
        {replacement.Stops && replacement.Stops.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Hållplatser:</p>
            <div className="space-y-1">
              {replacement.Stops.slice(0, 3).map((stop, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-muted-foreground">
                    {stop.StopDescription || stop.PlaceSignature || 'Hållplats'}
                  </span>
                  {stop.ExpectedDepartureTime && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatTime(stop.ExpectedDepartureTime)}
                    </span>
                  )}
                </div>
              ))}
              {replacement.Stops.length > 3 && (
                <p className="text-xs text-muted-foreground ml-4">
                  +{replacement.Stops.length - 3} fler hållplatser
                </p>
              )}
            </div>
          </div>
        )}

        {/* Map Button */}
        <div className="pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowMap(!showMap)}
            className="w-full"
          >
            {showMap ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showMap ? 'Dölj karta' : 'Visa på karta'}
          </Button>
        </div>

        {/* Map Component */}
        {showMap && replacement.Stops && replacement.Stops.length > 0 && (
          <div className="mt-4">
            <MapComponent
              stops={replacement.Stops.map(stop => ({
                latitude: stop.StopPosition?.Location?.Latitude || 0,
                longitude: stop.StopPosition?.Location?.Longitude || 0,
                name: stop.StopDescription || stop.PlaceSignature || 'Hållplats',
                departureTime: stop.ExpectedDepartureTime ? formatTime(stop.ExpectedDepartureTime) : undefined
              }))}
              className="h-64 w-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReplacementTrafficCard;
