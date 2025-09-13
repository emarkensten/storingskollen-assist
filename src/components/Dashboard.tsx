import React from 'react';
import DisruptionCard from './DisruptionCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';

interface Disruption {
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

interface DashboardProps {
  disruptions: Disruption[];
  onRefresh?: () => void;
  onAddTrip?: () => void;
}

const Dashboard = ({ disruptions, onRefresh, onAddTrip }: DashboardProps) => {

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Aktuella störningar</h2>
            <p className="text-muted-foreground mt-2">Dina bevakade resor med pågående störningar</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
              Uppdatera
            </Button>
            <Button variant="default" size="sm" onClick={onAddTrip}>
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