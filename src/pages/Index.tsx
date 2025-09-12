import React, { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TrainSearch from '@/components/TrainSearch';
import Dashboard from '@/components/Dashboard';
import DisruptionCard from '@/components/DisruptionCard';
import { trafikverketAPI, TrainAnnouncement } from '@/lib/trafikverket-api';

const Index = () => {
  const [foundTrains, setFoundTrains] = useState<TrainAnnouncement[]>([]);

  const handleTrainFound = (trainData: TrainAnnouncement) => {
    setFoundTrains(prev => {
      // Avoid duplicates
      const exists = prev.some(train => train.ActivityId === trainData.ActivityId);
      if (!exists) {
        return [trainData, ...prev];
      }
      return prev;
    });
  };

  const createDisruptionData = (train: TrainAnnouncement) => {
    const delay = trafikverketAPI.getDelayMinutes(train);
    const fromLocation = train.FromLocation?.[0]?.LocationName || 'Okänd';
    const toLocation = train.ToLocation?.[train.ToLocation.length - 1]?.LocationName || 'Okänd';
    
    let status: 'delayed' | 'cancelled' | 'replacement' = 'delayed';
    if (train.Canceled) {
      status = 'cancelled';
    } else if (train.Deviation && train.Deviation.some(d => d.Description.toLowerCase().includes('ersätt'))) {
      status = 'replacement';
    }

    return {
      trainNumber: train.AdvertisedTrainIdent,
      route: `${fromLocation} → ${toLocation}`,
      status,
      reason: train.Deviation?.[0]?.Description || 'Okänd orsak till störning',
      delay: delay > 0 ? `${trafikverketAPI.formatTime(train.EstimatedTimeAtLocation || train.AdvertisedTimeAtLocation)} (+${delay} min)` : undefined,
      replacement: status === 'replacement' ? {
        type: 'Ersättningsbuss',
        departure: 'Se stationsinformation',
        location: 'Kontakta kundservice för detaljer',
        identifier: 'Information kommer snart'
      } : undefined
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Börja bevaka din resa</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Lägg in din resa så håller vi koll på eventuella störningar och meddelar dig omedelbart om något händer.
            </p>
          </div>
          <TrainSearch onTrainFound={handleTrainFound} />
        </div>
      </section>

      {foundTrains.length > 0 && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground">Hittade störningar</h2>
              <p className="text-muted-foreground mt-2">Aktuell information om dina sökta tåg</p>
            </div>
            <div className="grid gap-6 max-w-4xl mx-auto">
              {foundTrains.map((train, index) => (
                <DisruptionCard
                  key={train.ActivityId || index}
                  {...createDisruptionData(train)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Dashboard />
    </div>
  );
};

export default Index;
