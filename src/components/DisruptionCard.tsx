import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Bus, MapPin, Info } from 'lucide-react';

interface DisruptionCardProps {
  trainNumber: string;
  route: string;
  status: 'delayed' | 'cancelled' | 'replacement';
  reason: string;
  delay?: string;
  replacement?: {
    type: string;
    departure: string;
    location: string;
    identifier: string;
  };
}

const DisruptionCard: React.FC<DisruptionCardProps> = ({
  trainNumber,
  route,
  status,
  reason,
  delay,
  replacement
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'delayed':
        return 'warning';
      case 'cancelled':
        return 'destructive';
      case 'replacement':
        return 'accent';
      default:
        return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'delayed':
        return 'Försenat';
      case 'cancelled':
        return 'Inställt';
      case 'replacement':
        return 'Ersättningstrafik';
      default:
        return 'Okänt';
    }
  };

  return (
    <Card className="w-full shadow-card border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tåg {trainNumber}</CardTitle>
          <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{route}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <p className="font-medium text-sm">Orsak till störning</p>
            <p className="text-sm text-muted-foreground">{reason}</p>
          </div>
        </div>

        {delay && (
          <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
            <Clock className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-sm">Ny beräknad avgångstid</p>
              <p className="text-sm text-muted-foreground">{delay}</p>
            </div>
          </div>
        )}

        {replacement && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-accent" />
              <h4 className="font-semibold text-accent">Ersättningstrafik tillgänglig</h4>
            </div>
            
            <div className="grid gap-3 ml-7">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Fordon:</span>
                <span className="text-sm text-muted-foreground">{replacement.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Avgång:</span>
                <span className="text-sm text-muted-foreground">{replacement.departure}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Plats:</span>
                <span className="text-sm text-muted-foreground">{replacement.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Kännetecken:</span>
                <span className="text-sm text-muted-foreground">{replacement.identifier}</span>
              </div>
              
              <Button variant="accent" size="sm" className="w-fit mt-2">
                <MapPin className="h-4 w-4" />
                Visa på karta
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm">
            <Info className="h-4 w-4" />
            Mer information
          </Button>
          <Button variant="secondary" size="sm">
            Uppdatera bevakning
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DisruptionCard;