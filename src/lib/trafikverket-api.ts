const API_KEY = '0d546260a4954c968923c98902418143';
const BASE_URL = 'https://api.trafikinfo.trafikverket.se/v2/data.json';

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

export interface TrainPosition {
  Train: {
    AdvertisedTrainIdent: string;
    Position: {
      WGS84: string;
    };
    Speed: number;
    TimeStamp: string;
  };
}

export interface TrainMessage {
  AffectedLocation: Array<{ LocationName: string }>;
  EventDateTime: string;
  Header: string;
  ReasonCode?: string;
  TrafficImpact?: Array<{ FromLocation: string; ToLocation: string }>;
}

class TrafikverketAPI {
  private async makeRequest<T>(query: string): Promise<T> {
    const requestBody = {
      authenticationkey: API_KEY,
      request: {
        login: {
          authenticationkey: API_KEY
        },
        query: query
      }
    };

    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.RESPONSE.RESULT[0];
    } catch (error) {
      console.error('Trafikverket API error:', error);
      throw error;
    }
  }

  async searchTrains(trainNumber: string, fromStation?: string, toStation?: string): Promise<TrainAnnouncement[]> {
    let filter = `<EQ name='AdvertisedTrainIdent' value='${trainNumber}' />`;
    
    if (fromStation) {
      filter += `<EQ name='FromLocation.LocationName' value='${fromStation}' />`;
    }
    
    if (toStation) {
      filter += `<EQ name='ToLocation.LocationName' value='${toStation}' />`;
    }

    const query = `
      <QUERY objecttype='TrainAnnouncement' schemaversion='1.9'>
        <FILTER>
          <AND>
            ${filter}
            <GT name='AdvertisedTimeAtLocation' value='$dateadd(-00:30:00)' />
            <LT name='AdvertisedTimeAtLocation' value='$dateadd(06:00:00)' />
          </AND>
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
    `;

    const result = await this.makeRequest<{ TrainAnnouncement: TrainAnnouncement[] }>(query);
    return result?.TrainAnnouncement || [];
  }

  async getTrainMessages(trainNumber?: string, location?: string): Promise<TrainMessage[]> {
    let filter = '<GT name=\'EventDateTime\' value=\'$dateadd(-02:00:00)\' />';
    
    if (trainNumber) {
      filter += `<LIKE name='TrafficImpact.FromLocation' value='%${trainNumber}%' />`;
    }

    if (location) {
      filter += `<EQ name='AffectedLocation.LocationName' value='${location}' />`;
    }

    const query = `
      <QUERY objecttype='TrainMessage' schemaversion='1.7'>
        <FILTER>
          <AND>
            ${filter}
          </AND>
        </FILTER>
        <INCLUDE>AffectedLocation</INCLUDE>
        <INCLUDE>EventDateTime</INCLUDE>
        <INCLUDE>Header</INCLUDE>
        <INCLUDE>ReasonCode</INCLUDE>
        <INCLUDE>TrafficImpact</INCLUDE>
      </QUERY>
    `;

    const result = await this.makeRequest<{ TrainMessage: TrainMessage[] }>(query);
    return result?.TrainMessage || [];
  }

  async getStations(searchTerm: string): Promise<Array<{ LocationName: string; LocationSignature: string }>> {
    const query = `
      <QUERY objecttype='TrainStation' schemaversion='1.4'>
        <FILTER>
          <LIKE name='AdvertisedLocationName' value='%${searchTerm}%' />
        </FILTER>
        <INCLUDE>AdvertisedLocationName</INCLUDE>
        <INCLUDE>LocationSignature</INCLUDE>
      </QUERY>
    `;

    const result = await this.makeRequest<{ TrainStation: Array<{ AdvertisedLocationName: string; LocationSignature: string }> }>(query);
    
    return result?.TrainStation?.map(station => ({
      LocationName: station.AdvertisedLocationName,
      LocationSignature: station.LocationSignature
    })) || [];
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