import React from 'react';
import DisruptionCard from './DisruptionCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';

const Dashboard = () => {
  // Mock data for disruptions
  const disruptions = [
    {
      trainNumber: '421',
      route: 'Stockholm Central → Göteborg Central',
      status: 'replacement' as const,
      reason: 'Signalfel strax utanför Södertälje Syd. Tekniker arbetar med att åtgärda problemet.',
      replacement: {
        type: 'Vit expressbuss märkt "SJ Ersättningstrafik"',
        departure: '14:10',
        location: 'Klarabergsviadukten, hållplats A',
        identifier: 'Reg.nr ABC 123'
      }
    },
    {
      trainNumber: '537',
      route: 'Malmö Central → Stockholm Central',
      status: 'delayed' as const,
      reason: 'Växelfel vid Lund har medfört förseningar i trafiken.',
      delay: '14:45 (+15 minuter)'
    }
  ];

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Aktuella störningar</h2>
            <p className="text-muted-foreground mt-2">Dina bevakade resor med pågående störningar</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
              Uppdatera
            </Button>
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4" />
              Lägg till resa
            </Button>
          </div>
        </div>

        <div className="grid gap-6 max-w-4xl mx-auto">
          {disruptions.map((disruption, index) => (
            <DisruptionCard
              key={index}
              trainNumber={disruption.trainNumber}
              route={disruption.route}
              status={disruption.status}
              reason={disruption.reason}
              delay={disruption.delay}
              replacement={disruption.replacement}
            />
          ))}
        </div>

        {disruptions.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-success/10 border border-success/20 rounded-lg p-8 max-w-md mx-auto">
              <p className="text-success font-medium">Inga störningar just nu!</p>
              <p className="text-muted-foreground text-sm mt-2">Alla dina bevakade resor går enligt plan.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;