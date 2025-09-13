import React, { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TrainSearch from '@/components/TrainSearch';
import Dashboard from '@/components/Dashboard';
import DisruptionCard from '@/components/DisruptionCard';
import { trafikverketAPI, TrainAnnouncement } from '@/lib/trafikverket-api';

const Index = () => {
  const [foundTrains, setFoundTrains] = useState<TrainAnnouncement[]>([]);
  const [disruptionData, setDisruptionData] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingDisruptionInfo, setIsLoadingDisruptionInfo] = useState(false);

  const handleTrainFound = async (trainData: TrainAnnouncement) => {
    setFoundTrains(prev => {
      // Avoid duplicates
      const exists = prev.some(train => train.ActivityId === trainData.ActivityId);
      if (!exists) {
        return [trainData, ...prev];
      }
      return prev;
    });

    // Create enhanced disruption data
    setIsLoadingDisruptionInfo(true);
    try {
      const disruption = await createDisruptionData(trainData);
      setDisruptionData(prev => {
        const exists = prev.some(d => d.trainNumber === disruption.trainNumber);
        if (!exists) {
          return [disruption, ...prev];
        }
        return prev;
      });
    } catch (error) {
      console.error('Error creating disruption data:', error);
    } finally {
      setIsLoadingDisruptionInfo(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh all found trains by re-fetching their data
      const refreshPromises = foundTrains.map(async (train) => {
        const results = await trafikverketAPI.searchTrains(train.AdvertisedTrainIdent);
        return results.find(t => t.ActivityId === train.ActivityId) || train;
      });
      
      const refreshedTrains = await Promise.all(refreshPromises);
      setFoundTrains(refreshedTrains);
    } catch (error) {
      console.error('Error refreshing trains:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddTrip = () => {
    // Scroll to the search section
    const searchSection = document.querySelector('section');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const createDisruptionData = async (train: TrainAnnouncement) => {
    const delay = trafikverketAPI.getDelayMinutes(train);
    const fromLocation = train.FromLocation?.[0]?.LocationName || 'Okänd';
    const toLocation = train.ToLocation?.[train.ToLocation.length - 1]?.LocationName || 'Okänd';
    
    let status: 'delayed' | 'cancelled' | 'replacement' = 'delayed';
    if (train.Canceled) {
      status = 'cancelled';
    } else if (train.Deviation && train.Deviation.some(d => d.Description.toLowerCase().includes('ersätt'))) {
      status = 'replacement';
    }

    // Get comprehensive disruption information
    const disruptionInfo = await trafikverketAPI.getComprehensiveDisruptionInfo(train);

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
      } : undefined,
      // Enhanced data
      replacementTraffic: disruptionInfo.replacementTraffic,
      railwayEvents: disruptionInfo.railwayEvents,
      operativeEvents: disruptionInfo.operativeEvents,
      enhancedReason: disruptionInfo.enhancedReason,
      assistantSummary: disruptionInfo.assistantSummary
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

      {(disruptionData.length > 0 || isLoadingDisruptionInfo) && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground">Hittade störningar</h2>
              <p className="text-muted-foreground mt-2">Aktuell information om dina sökta tåg</p>
            </div>
            
            {isLoadingDisruptionInfo && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Hämtar detaljerad information...
                </div>
              </div>
            )}
            
            <div className="grid gap-6 max-w-4xl mx-auto">
              {disruptionData.map((disruption, index) => (
                <DisruptionCard
                  key={disruption.trainNumber || index}
                  {...disruption}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Dashboard 
        disruptions={disruptionData} 
        onRefresh={handleRefresh}
        onAddTrip={handleAddTrip}
      />
    </div>
  );
};

export default Index;
