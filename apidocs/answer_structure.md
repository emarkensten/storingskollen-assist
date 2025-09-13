# Svaret
## URL
I URLen definieras vilken version som ska användas och ändelsen (xml eller json) anger format på det returnerade svaret.
https://api.trafikinfo.trafikverket.se/v[version]/data.[format]
Tillgängliga URLer:
~[https://api.trafikinfo.trafikverket.se/v2/data.xml](https://api.trafikinfo.trafikverket.se/v2/data.xml)~
~[https://api.trafikinfo.trafikverket.se/v2/data.json](https://api.trafikinfo.trafikverket.se/v2/data.json)~
Svaret har följande struktur.
Svaret omsluts av <RESPONSE/> vilken innehåller en eller flera <RESULT/> (ett för varje <QUERY/> som bifogades frågan). RESULT-elementet innehåller sedan inget, ett eller flera element som motsvarar ett dataobjekt. Namnet på elementen är samma som objektets datatyp.
Exempel XML:
<RESPONSE>
  <RESULT>
    <SomeObjectType>
      <Id>123<Id>
      <Name>Adam<Name>
    </SomeObjectType>
    <SomeObjectType>
      <Id>345<Id>
      <Name>Bertil<Name>
    </SomeObjectType>
  </RESULT>
</RESPONSE>
Exempel JSON:
{
   "RESPONSE":{
      "RESULT":[
         {
            "SomeObjectType":[
               {
                  "Id":"123",
                  "Name":"Adam"
               },
               {
                  "Id":"456",
                  "Name":"Bertil"
               }
            ]
         }
      ]
   }
}
Datafält som inte har något värde returneras ej.
Notera att alla datum- och tidsangivelser är angivna i svensk lokal tid utan indikering av tidzon om inget annat anges.
<AdvertisedTimeAtLocation>2014-02-19T11:22:00</AdvertisedTimeAtLocation>
Fältet ModifiedTime är ett fält som alltid är i UTC vilket också definieras i angivelsen (den slutar på 'Z'). Att fältet är i UTC är för att undvika problem vid synkronisering av förändrat data vid övergång mellan sommar- och vintertid.
<ModifiedTime>2014-02-20T09:45:17.874Z</ModifiedTime>
## Information
Vid sidan av returnerat data kan även övrig information från systemet returneras i ett INFO-element.
Exempel XML:
<RESPONSE>
  <RESULT>
    <INFO>
      <LASTMODIFIED datetime="2014-01-22T09:57:56.07Z"></LASTMODIFIED>
    </INFO>
  </RESULT>
</RESPONSE>
Exempel JSON:
{
    "RESPONSE":{
        "RESULT":[
            {
              "INFO": {
                "LASTMODIFIED": {
                  "@datetime": "2014-01-22T09:57:56.07Z"
                }
              }
            }
        ]
    }
}
## Felmeddelanden
Om något med anropet går fel så returneras någon av följande HTTP statuskoder:
|  |  |
|---|---|
| 206 | Partial Content - Svaret är för stort. Maximalt tillåten datamängd kommer att returneras av följt av ERROR som meddelar att svaret inte är komplett. |
| 401 | Unauthorized - Misslyckad autentisering. |
| 429 | Too Many Requests - För många förfrågningar. |
| 500 | Internal Server Error - Internt serverfel. |
| 501 | Not Implemented - Servern stödjer inte en funktion som efterfrågades av klienten. |
Svaret som returneras vid fel innehåller ett ERROR-element som beskriver felet.
Exempelsvar då frågan saknat LOGIN-element och statuskod 401 har returnerats.
Exempel XML:
<RESPONSE>
  <RESULT>
    <ERROR source="securitymanager">Missing the LOGIN element</ERROR>
  </RESULT>
</RESPONSE>
Exempel JSON:
{
    "RESPONSE":{
        "RESULT":[
            {
                "ERROR":{
                    "SOURCE":"securitymanager",
                    "MESSAGE":"Missing the LOGIN element"
                }
            }
        ]
    }
}
## 206 Partial Content
Om man avser att hämta stora datamängder är det stor risk att man inte får allt data i svaret och en statuskod 206 Partial Content. För detta användningsfall bör man använda sig av changeid i frågan. Svaret innehåller då även det största unika löpnumret (LASTCHANGEID) i datat som returnerades. Detta värde bifogas sedan i ett nytt anrop för att hämta resterande data. Se ~[Frågan/Förändrat data](https://data.trafikverket.se/documentation/datacache/the-request)~
## 429 Too Many Requests - Begränsning av antal anrop (Rate limiting)
För att säkerställa stabil drift och rättvis användning av tjänsten finns en begränsning på 100 anrop per sekund per authenticationkey.
Om denna gräns överskrids returnerar API:et svaret:
HTTP-statuskod: 429 Too Many Requests
Betydelse: Du har skickat fler anrop än vad som är tillåtet per tidsenhet.
När du får detta svar behöver du vänta en kort stund innan du fortsätter med nya anrop.
