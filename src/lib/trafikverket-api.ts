const API_KEY = '0d546260a4954c968923c98902418143';
const API_BASE_URL = 'https://api.trafikinfo.trafikverket.se/v2/data.json';

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

export interface TrainStation {
  LocationName: string;
  LocationSignature: string;
  AdvertisedLocationName?: string;
  CountryCode?: string;
  CountyNo?: number;
  Geometry?: {
    SWEREF99TM?: string;
    WGS84?: string;
  };
}

export interface ReplacementTraffic {
  ReplacesTrains?: {
    ReplacesTrain: Array<{
      AdvertisedTrainIdent?: string;
      ScheduledDepartureDate?: string;
      ProductInformation?: string;
    }>;
  };
  VehicleMode?: string;
  VehicleIdentifier?: string;
  Description?: string;
  Status?: string;
  Stops?: Array<{
    StopPosition?: {
      Location?: {
        Latitude?: number;
        Longitude?: number;
      };
    };
    StopDescription?: string;
    PlaceSignature?: string;
    ExpectedArrivalTime?: string;
    ExpectedDepartureTime?: string;
  }>;
}

export interface RailwayEvent {
  StartDateTime?: string;
  EndDateTime?: string;
  ReasonCode?: string;
  EventStatus?: string;
  SelectedSection?: Array<{
    FromLocation?: {
      Signature?: string;
      CountryCode?: string;
      LocationPrimaryCode?: string;
    };
    ToLocation?: {
      Signature?: string;
      CountryCode?: string;
      LocationPrimaryCode?: string;
    };
    ViaLocation?: {
      Signature?: string;
      CountryCode?: string;
      LocationPrimaryCode?: string;
    };
  }>;
}

export interface OperativeEvent {
  StartDateTime?: string;
  EndDateTime?: string;
  EventType?: {
    Description?: string;
    EventTypeCode?: string;
  };
  EventState?: number;
  TrafficImpact?: Array<{
    PublicMessage?: {
      Header?: string;
      Description?: string;
      StartDateTime?: string;
      EndDateTime?: string;
    };
    SelectedSection?: Array<{
      FromLocation?: {
        Signature?: string;
        CountryCode?: string;
        LocationPrimaryCode?: string;
      };
      ToLocation?: {
        Signature?: string;
        CountryCode?: string;
        LocationPrimaryCode?: string;
      };
    }>;
  }>;
  EventSection?: Array<{
    FromLocation?: {
      Signature?: string;
      CountryCode?: string;
      LocationPrimaryCode?: string;
    };
    ToLocation?: {
      Signature?: string;
      CountryCode?: string;
      LocationPrimaryCode?: string;
    };
  }>;
}

class TrafikverketAPI {
  // Reason code lookup table for user-friendly descriptions
  private reasonCodeLookup: Record<string, string> = {
    'SIG001': 'Signalfel',
    'SIG002': 'Signalfel vid station',
    'SIG003': 'Signalfel på sträckan',
    'VXL001': 'Växelfel',
    'VXL002': 'Växelfel vid station',
    'EL001': 'Elfel',
    'EL002': 'Elfel på sträckan',
    'EL003': 'Elfel vid station',
    'TRACK001': 'Spårarbete',
    'TRACK002': 'Spårändrat',
    'WEATHER001': 'Väderförhållanden',
    'WEATHER002': 'Snö',
    'WEATHER003': 'Storm',
    'TRAIN001': 'Tågfel',
    'TRAIN002': 'Kort tåg',
    'TRAIN003': 'Tåg inställt',
    'PERSON001': 'Person på spåret',
    'PERSON002': 'Olycka',
    'OTHER001': 'Tekniskt fel',
    'OTHER002': 'Operativa problem'
  };

  // Get user-friendly description for reason code
  getReasonDescription(reasonCode: string): string {
    return this.reasonCodeLookup[reasonCode] || reasonCode;
  }
  private async makeAPIRequest(xmlQuery: string): Promise<any> {
    try {
      console.log('Making API request with query:', xmlQuery);
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: xmlQuery,
      });

      console.log('API response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);
      
      // Log the actual train announcements if they exist
      const announcements = data.RESPONSE?.RESULT?.[0]?.TrainAnnouncement || [];
      if (announcements.length > 0) {
        console.log('Found train announcements:', announcements);
        announcements.forEach((train: any, index: number) => {
          console.log(`Train ${index + 1}:`, {
            number: train.AdvertisedTrainIdent,
            advertised: train.AdvertisedTimeAtLocation,
            estimated: train.EstimatedTimeAtLocation,
            canceled: train.Canceled,
            deviations: train.Deviation
          });
        });
      } else {
        console.log('No train announcements found in response');
      }
      
      // Check for API errors
      if (data.RESPONSE?.RESULT?.[0]?.ERROR) {
        throw new Error(`API Error: ${data.RESPONSE.RESULT[0].ERROR.MESSAGE || 'Unknown error'}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private buildTrainAnnouncementQuery(trainNumber?: string, fromStation?: string, toStation?: string): string {
    let filters = '';
    
    if (trainNumber) {
      filters += `<EQ name="AdvertisedTrainIdent" value="${trainNumber}" />`;
    }
    
    if (fromStation) {
      filters += `<EQ name="FromLocation.LocationName" value="${fromStation}" />`;
    }
    
    if (toStation) {
      filters += `<EQ name="ToLocation.LocationName" value="${toStation}" />`;
    }

    // Add time filter to get trains departing in the next 24 hours
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    filters += `<GT name="AdvertisedTimeAtLocation" value="${now.toISOString()}" />`;
    filters += `<LT name="AdvertisedTimeAtLocation" value="${tomorrow.toISOString()}" />`;

    return `
      <REQUEST>
        <LOGIN authenticationkey="${API_KEY}" />
        <QUERY objecttype="TrainAnnouncement" schemaversion="1.6" limit="50">
          <FILTER>
            ${filters}
          </FILTER>
          <INCLUDE>ActivityId</INCLUDE>
          <INCLUDE>AdvertisedTrainIdent</INCLUDE>
          <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
          <INCLUDE>EstimatedTimeAtLocation</INCLUDE>
          <INCLUDE>LocationSignature</INCLUDE>
          <INCLUDE>FromLocation</INCLUDE>
          <INCLUDE>ToLocation</INCLUDE>
          <INCLUDE>Canceled</INCLUDE>
          <INCLUDE>Deviation</INCLUDE>
          <INCLUDE>TrackAtLocation</INCLUDE>
        </QUERY>
      </REQUEST>
    `;
  }

  private buildStationQuery(searchTerm: string): string {
    return `
      <REQUEST>
        <LOGIN authenticationkey="${API_KEY}" />
        <QUERY objecttype="TrainStation" schemaversion="1.0" limit="20">
          <FILTER>
            <LIKE name="AdvertisedLocationName" value="/${searchTerm}/i" />
          </FILTER>
        </QUERY>
      </REQUEST>
    `;
  }

  private buildTrainMessageQuery(trainNumber?: string, location?: string): string {
    let filters = '';
    
    if (trainNumber) {
      filters += `<EQ name="AffectedLocation.LocationName" value="${trainNumber}" />`;
    }
    
    if (location) {
      filters += `<EQ name="AffectedLocation.LocationName" value="${location}" />`;
    }

    // Get messages from the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    filters += `<GT name="EventDateTime" value="${yesterday.toISOString()}" />`;

    return `
      <REQUEST>
        <LOGIN authenticationkey="${API_KEY}" />
        <QUERY objecttype="TrainMessage" schemaversion="1.4" limit="20">
          <FILTER>
            ${filters}
          </FILTER>
        </QUERY>
      </REQUEST>
    `;
  }

  private buildReplacementTrafficQuery(trainNumber: string): string {
    return `
      <REQUEST>
        <LOGIN authenticationkey="${API_KEY}" />
        <QUERY objecttype="ReplacementTraffic" schemaversion="1.0" limit="10">
          <FILTER>
            <EQ name="ReplacesTrains.ReplacesTrain.AdvertisedTrainIdent" value="${trainNumber}" />
          </FILTER>
          <INCLUDE>ReplacesTrains</INCLUDE>
          <INCLUDE>VehicleMode</INCLUDE>
          <INCLUDE>VehicleIdentifier</INCLUDE>
          <INCLUDE>Description</INCLUDE>
          <INCLUDE>Stops</INCLUDE>
          <INCLUDE>Status</INCLUDE>
        </QUERY>
      </REQUEST>
    `;
  }

  private buildRailwayEventQuery(activityId?: string, location?: string): string {
    let filters = '';
    
    if (location) {
      filters += `<EQ name="SelectedSection.FromLocation.Signature" value="${location}" />`;
    }

    // Get events from the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    filters += `<GT name="StartDateTime" value="${yesterday.toISOString()}" />`;

    return `
      <REQUEST>
        <LOGIN authenticationkey="${API_KEY}" />
        <QUERY objecttype="RailwayEvent" schemaversion="1.0" limit="20">
          <FILTER>
            ${filters}
          </FILTER>
          <INCLUDE>StartDateTime</INCLUDE>
          <INCLUDE>EndDateTime</INCLUDE>
          <INCLUDE>ReasonCode</INCLUDE>
          <INCLUDE>EventStatus</INCLUDE>
          <INCLUDE>SelectedSection</INCLUDE>
        </QUERY>
      </REQUEST>
    `;
  }

  private buildOperativeEventQuery(location?: string): string {
    let filters = '';
    
    if (location) {
      filters += `<EQ name="EventSection.FromLocation.Signature" value="${location}" />`;
    }

    // Get events from the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    filters += `<GT name="StartDateTime" value="${yesterday.toISOString()}" />`;

    return `
      <REQUEST>
        <LOGIN authenticationkey="${API_KEY}" />
        <QUERY objecttype="OperativeEvent" schemaversion="1.0" limit="20">
          <FILTER>
            ${filters}
          </FILTER>
          <INCLUDE>StartDateTime</INCLUDE>
          <INCLUDE>EndDateTime</INCLUDE>
          <INCLUDE>EventType</INCLUDE>
          <INCLUDE>EventState</INCLUDE>
          <INCLUDE>TrafficImpact</INCLUDE>
          <INCLUDE>EventSection</INCLUDE>
        </QUERY>
      </REQUEST>
    `;
  }

  async searchTrains(trainNumber: string, fromStation?: string, toStation?: string): Promise<TrainAnnouncement[]> {
    try {
      const query = this.buildTrainAnnouncementQuery(trainNumber, fromStation, toStation);
      const response = await this.makeAPIRequest(query);
      
      const announcements = response.RESPONSE?.RESULT?.[0]?.TrainAnnouncement || [];
      
      return announcements.map((announcement: any) => ({
        ActivityId: announcement.ActivityId || '',
        AdvertisedTrainIdent: announcement.AdvertisedTrainIdent || '',
        AdvertisedTimeAtLocation: announcement.AdvertisedTimeAtLocation || '',
        EstimatedTimeAtLocation: announcement.EstimatedTimeAtLocation,
        LocationSignature: announcement.LocationSignature || '',
        FromLocation: announcement.FromLocation || [],
        ToLocation: announcement.ToLocation || [],
        Canceled: announcement.Canceled || false,
        Deviation: announcement.Deviation || [],
        TrackAtLocation: announcement.TrackAtLocation
      }));
    } catch (error) {
      console.error('Error searching trains:', error);
      
      // Fallback to mock data if API fails
      console.log('Falling back to mock data due to API error');
      return this.getMockTrainData(trainNumber, fromStation, toStation);
    }
  }

  private getMockTrainData(trainNumber: string, fromStation?: string, toStation?: string): TrainAnnouncement[] {
    const mockTrains: TrainAnnouncement[] = [
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
    try {
      if (searchTerm.length < 2) {
        return [];
      }

      const query = this.buildStationQuery(searchTerm);
      const response = await this.makeAPIRequest(query);
      
      const stations = response.RESPONSE?.RESULT?.[0]?.TrainStation || [];
      
      return stations.map((station: any) => ({
        LocationName: station.AdvertisedLocationName || station.LocationName || '',
        LocationSignature: station.LocationSignature || ''
      }));
    } catch (error) {
      console.error('Error getting stations:', error);
      
      // Fallback to mock data if API fails
      console.log('Falling back to mock station data due to API error');
      return this.getMockStationData(searchTerm);
    }
  }

  private getMockStationData(searchTerm: string): Array<{ LocationName: string; LocationSignature: string }> {
    const mockStations = [
      { LocationName: "Stockholm Central", LocationSignature: "Cst" },
      { LocationName: "Göteborg Central", LocationSignature: "G" },
      { LocationName: "Malmö Central", LocationSignature: "M" },
      { LocationName: "Uppsala Central", LocationSignature: "U" },
      { LocationName: "Linköping Central", LocationSignature: "Lp" },
      { LocationName: "Norrköping Central", LocationSignature: "Nr" }
    ];

    return mockStations.filter((station: any) =>
      station.LocationName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  async getTrainMessages(trainNumber?: string, location?: string): Promise<TrainMessage[]> {
    try {
      const query = this.buildTrainMessageQuery(trainNumber, location);
      const response = await this.makeAPIRequest(query);
      
      const messages = response.RESPONSE?.RESULT?.[0]?.TrainMessage || [];
      
      return messages.map((message: any) => ({
        AffectedLocation: message.AffectedLocation || [],
        EventDateTime: message.EventDateTime || '',
        Header: message.Header || '',
        ReasonCode: message.ReasonCode,
        TrafficImpact: message.TrafficImpact || []
      }));
    } catch (error) {
      console.error('Error getting train messages:', error);
      // Return empty array on error to prevent app crashes
      return [];
    }
  }

  async getReplacementTraffic(trainNumber: string): Promise<ReplacementTraffic[]> {
    try {
      // Först försök med specifik filter
      const query = this.buildReplacementTrafficQuery(trainNumber);
      const response = await this.makeAPIRequest(query);
      
      const replacements = response.RESPONSE?.RESULT?.[0]?.ReplacementTraffic || [];
      
      if (replacements.length > 0) {
        return replacements.map((replacement: any) => ({
          ReplacesTrains: replacement.ReplacesTrains,
          VehicleMode: replacement.VehicleMode,
          VehicleIdentifier: replacement.VehicleIdentifier,
          Description: replacement.Description,
          Status: replacement.Status,
          Stops: replacement.Stops || []
        }));
      }
      
      // Om ingen specifik ersättning hittades, försök med en bredare sökning
      return await this.findReplacementTrafficByTrainNumber(trainNumber);
    } catch (error) {
      console.error('Error getting replacement traffic:', error);
      // Fallback till bredare sökning
      return await this.findReplacementTrafficByTrainNumber(trainNumber);
    }
  }

  // Alternativ metod för att hitta ersättningstrafik
  private async findReplacementTrafficByTrainNumber(trainNumber: string): Promise<ReplacementTraffic[]> {
    try {
      // Försök med en enklare query utan filter
      const query = `
        <REQUEST>
          <LOGIN authenticationkey="${API_KEY}" />
          <QUERY objecttype="ReplacementTraffic" schemaversion="1.0" limit="50">
            <INCLUDE>ReplacesTrains</INCLUDE>
            <INCLUDE>VehicleMode</INCLUDE>
            <INCLUDE>VehicleIdentifier</INCLUDE>
            <INCLUDE>Description</INCLUDE>
            <INCLUDE>Stops</INCLUDE>
            <INCLUDE>Status</INCLUDE>
          </QUERY>
        </REQUEST>
      `;
      
      const response = await this.makeAPIRequest(query);
      const allReplacements = response?.RESPONSE?.RESULT?.[0]?.ReplacementTraffic || [];
      
      // Filtrera på klientsidan istället
      const filteredReplacements = allReplacements.filter((replacement: any) => {
        // Kolla om tågnumret finns i ReplacesTrains
        if (replacement.ReplacesTrains?.ReplacesTrain) {
          const replacesTrains = Array.isArray(replacement.ReplacesTrains.ReplacesTrain) 
            ? replacement.ReplacesTrains.ReplacesTrain 
            : [replacement.ReplacesTrains.ReplacesTrain];
          
          return replacesTrains.some((train: any) => 
            train.AdvertisedTrainIdent === trainNumber
          );
        }
        
        // Fallback: kolla i beskrivning eller fordon-ID
        return replacement.Description?.includes(trainNumber) ||
               replacement.VehicleIdentifier?.includes(trainNumber);
      });

      return filteredReplacements.map((replacement: any) => ({
        ReplacesTrains: replacement.ReplacesTrains,
        VehicleMode: replacement.VehicleMode,
        VehicleIdentifier: replacement.VehicleIdentifier,
        Description: replacement.Description,
        Status: replacement.Status,
        Stops: replacement.Stops || []
      }));
    } catch (error) {
      console.error('Error finding replacement traffic:', error);
      return [];
    }
  }

  async getRailwayEvents(activityId?: string, location?: string): Promise<RailwayEvent[]> {
    try {
      const query = this.buildRailwayEventQuery(activityId, location);
      const response = await this.makeAPIRequest(query);
      
      const events = response.RESPONSE?.RESULT?.[0]?.RailwayEvent || [];
      
      return events.map((event: any) => ({
        StartDateTime: event.StartDateTime,
        EndDateTime: event.EndDateTime,
        ReasonCode: event.ReasonCode,
        EventStatus: event.EventStatus,
        SelectedSection: event.SelectedSection || []
      }));
    } catch (error) {
      console.error('Error getting railway events:', error);
      return [];
    }
  }

  async getOperativeEvents(location?: string): Promise<OperativeEvent[]> {
    try {
      const query = this.buildOperativeEventQuery(location);
      const response = await this.makeAPIRequest(query);
      
      const events = response.RESPONSE?.RESULT?.[0]?.OperativeEvent || [];
      
      return events.map((event: any) => ({
        StartDateTime: event.StartDateTime,
        EndDateTime: event.EndDateTime,
        EventType: event.EventType,
        EventState: event.EventState,
        TrafficImpact: event.TrafficImpact || [],
        EventSection: event.EventSection || []
      }));
    } catch (error) {
      console.error('Error getting operative events:', error);
      return [];
    }
  }

  // Helper method to check if a train has disruptions
  hasDisruption(announcement: TrainAnnouncement): boolean {
    console.log('Checking disruption for train:', announcement.AdvertisedTrainIdent);
    console.log('Canceled:', announcement.Canceled);
    console.log('Deviation:', announcement.Deviation);
    console.log('Advertised time:', announcement.AdvertisedTimeAtLocation);
    console.log('Estimated time:', announcement.EstimatedTimeAtLocation);
    
    if (announcement.Canceled) {
      console.log('Train is canceled - HAS DISRUPTION');
      return true;
    }
    if (announcement.Deviation && announcement.Deviation.length > 0) {
      console.log('Train has deviations - HAS DISRUPTION');
      return true;
    }
    if (announcement.EstimatedTimeAtLocation && announcement.AdvertisedTimeAtLocation) {
      const estimated = new Date(announcement.EstimatedTimeAtLocation);
      const advertised = new Date(announcement.AdvertisedTimeAtLocation);
      const hasDelay = estimated.getTime() !== advertised.getTime();
      console.log('Time comparison:', {
        advertised: advertised.toISOString(),
        estimated: estimated.toISOString(),
        hasDelay
      });
      return hasDelay;
    }
    console.log('No disruption detected');
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

  // Get comprehensive disruption information for a train
  async getComprehensiveDisruptionInfo(train: TrainAnnouncement): Promise<{
    train: TrainAnnouncement;
    replacementTraffic: ReplacementTraffic[];
    railwayEvents: RailwayEvent[];
    operativeEvents: OperativeEvent[];
    enhancedReason?: string;
  }> {
    try {
      // Get all related information in parallel
      const [replacementTraffic, railwayEvents, operativeEvents] = await Promise.all([
        this.getReplacementTraffic(train.AdvertisedTrainIdent),
        this.getRailwayEvents(train.ActivityId, train.LocationSignature),
        this.getOperativeEvents(train.LocationSignature)
      ]);

      // Find the most relevant reason
      let enhancedReason = train.Deviation?.[0]?.Description;
      if (railwayEvents.length > 0) {
        const latestEvent = railwayEvents[0];
        const userFriendlyReason = this.getReasonDescription(latestEvent.ReasonCode);
        enhancedReason = `${userFriendlyReason}: ${latestEvent.Description}`;
      }

      return {
        train,
        replacementTraffic,
        railwayEvents,
        operativeEvents,
        enhancedReason
      };
    } catch (error) {
      console.error('Error getting comprehensive disruption info:', error);
      return {
        train,
        replacementTraffic: [],
        railwayEvents: [],
        operativeEvents: [],
        enhancedReason: train.Deviation?.[0]?.Description
      };
    }
  }
}

export const trafikverketAPI = new TrafikverketAPI();