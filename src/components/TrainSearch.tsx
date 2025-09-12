import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Train, Clock, MapPin } from 'lucide-react';

const TrainSearch = () => {
  const [trainNumber, setTrainNumber] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Train className="h-5 w-5 text-primary" />
          Bevaka din resa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Från</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Stockholm Central"
                value={fromStation}
                onChange={(e) => setFromStation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Till</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Göteborg Central"
                value={toStation}
                onChange={(e) => setToStation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tågnummer</label>
          <div className="relative">
            <Train className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="421"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Button variant="hero" size="lg" className="w-full">
          <Search className="h-4 w-4" />
          Starta bevakning
        </Button>
      </CardContent>
    </Card>
  );
};

export default TrainSearch;