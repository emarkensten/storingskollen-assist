import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Train, Clock, MapPin, Loader2 } from 'lucide-react';
import { trafikverketAPI } from '@/lib/trafikverket-api';
import { useToast } from '@/hooks/use-toast';

interface Station {
  LocationName: string;
  LocationSignature: string;
}

const TrainSearch = ({ onTrainFound }: { onTrainFound?: (trainData: any) => void }) => {
  const [trainNumber, setTrainNumber] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const { toast } = useToast();

  // Search for stations when user types
  const searchStations = async (query: string) => {
    if (query.length < 2) {
      setStations([]);
      return;
    }
    
    try {
      const results = await trafikverketAPI.getStations(query);
      setStations(results.slice(0, 5)); // Limit to 5 suggestions
    } catch (error) {
      console.error('Error searching stations:', error);
    }
  };

  const handleFromStationChange = (value: string) => {
    setFromStation(value);
    setShowFromSuggestions(true);
    searchStations(value);
  };

  const handleToStationChange = (value: string) => {
    setToStation(value);
    setShowToSuggestions(true);
    searchStations(value);
  };

  const selectStation = (station: Station, isFrom: boolean) => {
    if (isFrom) {
      setFromStation(station.LocationName);
      setShowFromSuggestions(false);
    } else {
      setToStation(station.LocationName);
      setShowToSuggestions(false);
    }
  };

  const handleSearch = async () => {
    if (!trainNumber.trim()) {
      toast({
        title: "Tågnummer saknas",
        description: "Ange ett tågnummer för att börja bevaka din resa.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    try {
      const results = await trafikverketAPI.searchTrains(
        trainNumber,
        fromStation || undefined,
        toStation || undefined
      );

      if (results.length === 0) {
        toast({
          title: "Inget tåg hittades",
          description: "Kontrollera tågnummer och stationer. Tåget kanske inte trafikerar idag.",
          variant: "destructive"
        });
      } else {
        // Take the first train from search results
        const firstTrain = results[0];
        
        // Add the first train for monitoring regardless of disruption status
        if (onTrainFound) {
          onTrainFound(firstTrain);
        }
        
        // Check if the first train has disruptions and show appropriate message
        const hasDisruption = trafikverketAPI.hasDisruption(firstTrain);
        
        if (hasDisruption) {
          toast({
            title: "Tåg hittat med störning!",
            description: `Tåg ${trainNumber} har pågående störning(ar). Hämtar detaljerad information...`
          });
        } else {
          toast({
            title: "Tåg hittat och bevakas",
            description: `Tåg ${trainNumber} går enligt plan. Du får meddelande om störningar inträffar.`
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Fel vid sökning",
        description: "Kunde inte ansluta till Trafikverkets API. Försök igen senare.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

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
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-foreground">Från</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Stockholm Central"
                value={fromStation}
                onChange={(e) => handleFromStationChange(e.target.value)}
                onFocus={() => setShowFromSuggestions(true)}
                onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                className="pl-10"
              />
              {showFromSuggestions && stations.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {stations.map((station, index) => (
                    <button
                      key={index}
                      className="w-full px-3 py-2 text-left hover:bg-muted text-sm"
                      onClick={() => selectStation(station, true)}
                    >
                      {station.LocationName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-foreground">Till</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Göteborg Central"
                value={toStation}
                onChange={(e) => handleToStationChange(e.target.value)}
                onFocus={() => setShowToSuggestions(true)}
                onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                className="pl-10"
              />
              {showToSuggestions && stations.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {stations.map((station, index) => (
                    <button
                      key={index}
                      className="w-full px-3 py-2 text-left hover:bg-muted text-sm"
                      onClick={() => selectStation(station, false)}
                    >
                      {station.LocationName}
                    </button>
                  ))}
                </div>
              )}
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
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        <Button 
          variant="hero" 
          size="lg" 
          className="w-full" 
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Söker tåg...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Starta bevakning
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TrainSearch;