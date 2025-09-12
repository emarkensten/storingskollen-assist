const API_KEY = '0d546260a4954c968923c98902418143';

export interface TrainAnnouncement {
  ActivityId: string;
  AdvertisedTrainIdent: string;
  AdvertisedTimeAtLocation: string;
  EstimatedTimeAtLocation?: string;
  LocationSignature: string;
  FromLocation?: Array<{ LocationName: string; Order: number }>;
  ToLocation?: Array<{ LocationName: string; Order: number }>;
  Canceled: boolean;
  Deviation?: Array<{ Description: string; Code: string }>;
  TrackAtLocation?: string;
}

export interface TrainMessage {
  AffectedLocation: Array<{ LocationName: string }>;
  EventDateTime: string;
  Header: string;
  ReasonCode?: string;
  TrafficImpact?: Array<{ FromLocation: string; ToLocation: string }>;
}

class TrafikverketAPI {
  private getMockData(type: 'trains' | 'stations'): any {
    if (type === 'stations') {
      return [
        { LocationName: "Stockholm Central", LocationSignature: "Cst" },
        { LocationName: "Göteborg Central", LocationSignature: "G" },
        { LocationName: "Malmö Central", LocationSignature: "M" },
        { LocationName: "Uppsala Central", LocationSignature: "U" },
        { LocationName: "Linköping Central", LocationSignature: "Lp" },
        { LocationName: "Norrköping Central", LocationSignature: "Nr" }
      ];
    }
    
    return [
      {
        ActivityId: "mock-activity-1",
        AdvertisedTrainIdent: "421",
        AdvertisedTimeAtLocation: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        EstimatedTimeAtLocation: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        LocationSignature: "Cst",
        FromLocation: [{ LocationName: "Stockholm Central", Order: 1 }],
        ToLocation: [{ LocationName: "Göteborg Central", Order: 10 }],
        Canceled: false,
        Deviation: [{ Description: "Signalfel vid Södertälje Syd orsakar förseningar", Code: "SIG001" }],
        TrackAtLocation: "3"
      },
      {
        ActivityId: "mock-activity-2",
        AdvertisedTrainIdent: "537",
        AdvertisedTimeAtLocation: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        EstimatedTimeAtLocation: undefined,
        LocationSignature: "M",
        FromLocation: [{ LocationName: "Malmö Central", Order: 1 }],
        ToLocation: [{ LocationName: "Stockholm Central", Order: 15 }],
        Canceled: true,
        Deviation: [{ Description: "Tåget är inställt på grund av växelfel vid Lund", Code: "VXL002" }],
        TrackAtLocation: "2"
      }
    ];
  }

  async searchTrains(trainNumber: string, fromStation?: string, toStation?: string): Promise<TrainAnnouncement[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockTrains = this.getMockData('trains');
    
    // Filter based on search criteria
    return mockTrains.filter((train: TrainAnnouncement) => {
      const matchesNumber = train.AdvertisedTrainIdent.includes(trainNumber);
      const matchesFrom = !fromStation || 
        train.FromLocation?.some(loc => 
          loc.LocationName.toLowerCase().includes(fromStation.toLowerCase())
        );
      const matchesTo = !toStation || 
        train.ToLocation?.some(loc => 
          loc.LocationName.toLowerCase().includes(toStation.toLowerCase())
        );
      
      return matchesNumber && matchesFrom && matchesTo;
    });
  }

  async getStations(searchTerm: string): Promise<Array<{ LocationName: string; LocationSignature: string }>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockStations = this.getMockData('stations');
    
    return mockStations.filter((station: any) =>
      station.LocationName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  async getTrainMessages(trainNumber?: string, location?: string): Promise<TrainMessage[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        AffectedLocation: [{ LocationName: "Stockholm Central" }],
        EventDateTime: new Date().toISOString(),
        Header: "Förseningar på grund av signalfel",
        ReasonCode: "SIG001",
        TrafficImpact: [{ FromLocation: "Stockholm C", ToLocation: "Göteborg C" }]
      }
    ];
  }

  // Helper method to check if a train has disruptions
  hasDisruption(announcement: TrainAnnouncement): boolean {
    if (announcement.Canceled) return true;
    if (announcement.Deviation && announcement.Deviation.length > 0) return true;
    if (announcement.EstimatedTimeAtLocation && announcement.AdvertisedTimeAtLocation) {
      const estimated = new Date(announcement.EstimatedTimeAtLocation);
      const advertised = new Date(announcement.AdvertisedTimeAtLocation);
      return estimated.getTime() !== advertised.getTime();
    }
    return false;
  }

  // Helper method to get delay in minutes
  getDelayMinutes(announcement: TrainAnnouncement): number {
    if (!announcement.EstimatedTimeAtLocation || !announcement.AdvertisedTimeAtLocation) return 0;
    
    const estimated = new Date(announcement.EstimatedTimeAtLocation);
    const advertised = new Date(announcement.AdvertisedTimeAtLocation);
    
    return Math.round((estimated.getTime() - advertised.getTime()) / (1000 * 60));
  }

  // Helper method to format time
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('sv-SE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}

export const trafikverketAPI = new TrafikverketAPI();