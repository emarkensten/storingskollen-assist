# Frågans uppbyggnad
Så här kan en fråga exempelvis se ut:
<REQUEST>
  <LOGIN authenticationkey="SomeAuthenticationKey" />
  <QUERY objecttype="SomeObjectType" schemaversion="SomeObjectVersion" limit="10">
  <FILTER>
    <EQ name="SomeDataField" value="2" />
  </FILTER>
  </QUERY>
</REQUEST>
Frågan skickas med ett POST-anrop, publiceringspunktens filändelse avgör formatet på svaret.
I URLen definieras vilken version som ska användas och ändelsen (xml eller json) anger formatet på det returnerade svaret.
Tillgängliga URLer:
~[https://api.trafikinfo.trafikverket.se/v2/data.xml](https://api.trafikinfo.trafikverket.se/v2/data.xml)~
~[https://api.trafikinfo.trafikverket.se/v2/data.json](https://api.trafikinfo.trafikverket.se/v2/data.json)~
<REQUEST/> omsluter frågan. Den måste innehålla <LOGIN/> och en eller flera <QUERY/>.
<LOGIN/> måste innehålla attributet authenticationkey där användarens unika nyckel anges. (Genom ~[registrera](https://data.trafikverket.se/oauth2/Account/register)~ fås tillgång till nycklar.)
<QUERY/> kan ha ett antal olika attribut:
|  |  |
|---|---|
| objecttype | (obligatorisk) anger datatypen som efterfrågas. Se ~[Datamodell](https://data.trafikverket.se/documentation/datacache/data-model)~ för tillgängliga datatyper. |
| namespace | anges om datatypen som efterfrågas tillhör ett namespace. Tillhör objekttypen ett namespace visas detta för respektive datatyp på sidan ~[Datamodell](https://data.trafikverket.se/documentation/datacache/data-model)~.<br>Exempel<br> |
| schemaversion | (obligatorisk från api version 2) anger schemaversion för den datatyp som efterfrågas. Se ~[Datamodell](https://data.trafikverket.se/documentation/datacache/data-model)~ för tillgängliga schemaversioner. |
| id | kan innehålla ett av användaren godtyckligt värde som också returneras i svaret. (Om anropet innehåller flera frågor kan id-attributet användas för att veta vilket svar som hör ihop med vilken fråga.) |
| includedeletedobjects | borttagna dataposter returneras om satt till true (läs mer under ~[Förändrat data](https://data.trafikverket.se/documentation/datacache/the-request#F%C3%B6r%C3%A4ndrat%20data)~) |
| limit | begränsar antalet dataposter i svaret |
| orderby | anger på vilket eller vilka datafält sortering skall göras. Sorteringsordning anges med asc (ascending) eller desc (descending) efter datafältet (asc är default). Flera datafält separeras med komma-tecken. <br>Exempel<br> |
| skip | hoppar över ett visst antal dataposter i svaret (endast praktiskt användbart på statiskt data). Kan t.ex. användas vid paginering. |
| lastmodified | returnerar tidpunkten för senast uppdaterade (ModifiedTime) datapost från returnerat dataset om satt till true. Returneras under, se ~[Svaret](https://data.trafikverket.se/documentation/datacache/the-response)~ |
| changeid | anger att man vill ha förändringar efter angivet unika löpnummer. Resultatet innehåller även största löpnummret i returnerat data, returneras under <INFO><LASTCHANGEID>. Tillgänglig från och med version 2. |
<FILTER/> måste finns under <QUERY/>, även om inga filteroperatorer anges. Det är här som det specificeras vilket data som ska returneras. Det finns ett antal olika operatorer för att bygga ihop ett filter.
|  |  |
|---|---|
| <EQ/> | ”Equals”, lika med |
| <EXISTS/> | ”Exists”, värde existerar (value="true |
| <GT/> | ”Greater Than”, större än |
| <GTE/> | ”Greater Than or Equal”, större än eller lika med |
| <LT/> | ”Less Than”, mindre än |
| <LTE/> | ”Less Than or Equals”, mindre än eller lika med |
| <NE/> | ”Not Equal”, inte lika med |
| <LIKE/> | ”Like”, testar om värdet matchar ett reguljärt uttryck. Exempelvis för att kolla om datafältet börjar med texten ”bl” <LIKE name="SomeData" value="/^bl/" />﻿ |
| <NOTLIKE/> | ”Not Like”, testar om värdet inte matchar ett reguljärt uttryck |
| <IN/> | ”In”, testar om värdet finns med i en lista av värden |
| <NOTIN/> | ”Not In”, testar om värdet inte finns med i en lista av värden |
| <WITHIN/> | ”Within”, testar om värdet finns inom en geometri, läs mer under avsnitt ~[Geo-sökningar](https://data.trafikverket.se/documentation/datacache/the-request#Geo-s%C3%B6kningar)~ |
| <INTERSECTS/> | ”Intersects”, testar om en geometri skär en annan, läs mer under avsnitt ~[Geo-sökningar](https://data.trafikverket.se/documentation/datacache/the-request#Geo-s%C3%B6kningar)~ |
| <NEAR/> | ”Near” testar om värdet finns i närheten av en punkt, läs mer under avsnitt ~[Geo-sökningar](https://data.trafikverket.se/documentation/datacache/the-request#Geo-s%C3%B6kningar)~ |
Operatorerna har två attribut:
|  |  |
|---|---|
| name | anger namnet på datafältet som operatorn ska användas på. |
| value | värdet att jämföra med datafältets värde |
(Operatorn <WITHIN/> kan även ha attributen shape och radius).
Operatorerna kan grupperas genom att de omsluts av följande:
|  |  |
|---|---|
| <OR/> | ”Or” (testar att minst en av operatorerna är sann) |
| <AND/> | ”And” (testar att alla operatorer är sanna) |
| <ELEMENTMATCH/> | ”Element match” (testar att samtliga operatorer är sanna för ett och samma element i en array)<br>Exempel<br>Låt säga att vi har följande fiktiva dataset.<br>{  <br>    User:{  <br>        Name:"User_1",<br>        Results:[  <br>            {  <br>                Product:"abc",<br>                Score:9<br>            },<br>            {  <br>                Product:"xyz",<br>                Score:5<br>            }<br>        ]<br>    }<br>    }<br>    {  <br>    User:{  <br>        Name:"User_2",<br>        Results:[  <br>            {  <br>                Product:"abc",<br>                Score:5<br>            },<br>            {  <br>                Product:"xyz",<br>                Score:7<br>            }<br>        ]<br>    }<br>}<br>Om frågan grupperar operatorerna med omslutande ELEMENTMATCH så måste samtliga kriterier vara uppfyllda för ett och samma element i arrayen.<br><FILTER><br>    <ELEMENTMATCH><br>        <EQ name="User.Results.Product" value="abc" /><br>        <GT name="User.Results.Score" value="6" /><br>    </ELEMENTMATCH><br></FILTER><br>Resultatet ger då att det enbart är ett av User-objekten som uppfyller filterkriterierna.<br>                        <br>                        {  <br>   User:{  <br>      Name:"User_1",<br>      Results:[  <br>         {  <br>            Product:"abc",  // Uppfyller Product='abc'<br>            Score:9         // Uppfyller Score>6<br>         },<br>         {  <br>            Product:"xyz",<br>            Score:5<br>         }<br>      ]<br>   }<br>}<br>                        <br>                    <br>Skulle man använt AND istället för ELEMENTMATCH så räcker det med att ett kriterie var uppfyllt i ett array-element och det andra krieteriet i ett annat element.<br><FILTER><br>    <AND><br>        <EQ name="User.Results.Product" value="abc" /><br>        <GT name="User.Results.Score" value="6" /><br>    </AND><br></FILTER><br>Båda User-objekten hade då returnerats.<br>                        <br>                        {  <br>   User:{  <br>      Name:"User_1",<br>      Results:[  <br>         {  <br>            Product:"abc",  // Uppfyller Product='abc'<br>            Score:9         // Uppfyller Score>6<br>         },<br>         {  <br>            Product:"xyz",<br>            Score:5<br>         }<br>      ]<br>   }<br>}<br>{  <br>   User:{  <br>      Name:"User_2",<br>      Results:[  <br>         {  <br>            Product:"abc",  // Uppfyller Product='abc'<br>            Score:5<br>         },<br>         {  <br>            Product:"xyz",<br>            Score:7         // Uppfyller Score>6<br>         }<br>      ]<br>   }<br>}<br>                        <br>                     |
| <NOT/> | ”Not” (Anger att dess ingående operatorer är falska, anges flera operatorer utan att omslutas av en And/Or/ElementMatch operator så används And)<br>Exempel<br>Antag att du har följande dataset<br>                <br>{<br>    "RESPONSE": {<br>    "RESULT": [<br>        {<br>        "TrainAnnouncement": [<br>            {<br>            "ActivityId": "1",<br>            "ActivityType": "Avgang",<br>            "Advertised": true<br>            },<br>            {<br>            "ActivityId": "2",<br>            "ActivityType": "Avgang",<br>            "Advertised": false<br>            },<br>            {<br>            "ActivityId": "3",<br>            "ActivityType": "Ankomst",<br>            "Advertised": true<br>            },<br>            {<br>            "ActivityId": "4",<br>            "ActivityType": "Ankomst",<br>            "Advertised": false<br>            }<br>        ]<br>        }<br>    }<br>}<br>                <br>Ställer man då följande fråga med NOT så innebär det att alla resultat där ActivityType = 'Avgang' och Advertised = true blir uteslutna ur resultatet<br><FILTER><br>    <NOT><br>        <EQ name="ActivityType" value="Avgang" /><br>        <GT name="Advertised" value="true" /><br>    </NOT><br></FILTER><br>                <br>Vilket ger följande<br>   "RESPONSE": {<br>    "RESULT": [<br>        {<br>        "TrainAnnouncement": [<br>            {<br>            "ActivityId": "2",<br>            "ActivityType": "Avgang",<br>            "Advertised": false<br>            },<br>            {<br>            "ActivityId": "3",<br>            "ActivityType": "Ankomst",<br>            "Advertised": true<br>            },<br>            {<br>            "ActivityId": "4",<br>            "ActivityType": "Ankomst",<br>            "Advertised": false<br>            }<br>        ]<br>        }<br>    }<br>}<br>                <br>Lägger man däremot in en Or-operator i Not-operatorn så blir alla poster som antingen har ActivityType = 'Avgang' eller Advertised = true uteslutna<br><FILTER><br>    <NOT><br>        <OR><br>            <EQ name="ActivityType" value="Avgang" /><br>            <GT name="Advertised" value="true" /><br>        </OR><br>    </NOT><br></FILTER><br>                <br>Vilket skulle ge följande svar<br>{<br>    "RESPONSE": {<br>    "RESULT": [<br>        {<br>        "TrainAnnouncement": [<br>            {<br>            "ActivityId": "4",<br>            "ActivityType": "Ankomst",<br>            "Advertised": false<br>            }<br>        ]<br>        }<br>    }<br>}<br>                 |
Dessa fyra (OR, AND, NOT och ELEMENTMATCH) är också operatorer vilket innebär att de kan nästlas.
Ett exempel på ett filter:
<FILTER>
    <OR>
        <AND>
            <EQ name="User.Name" value="kalle anka" />
            <IN name="User.Category" value="a, b, c" />
        </AND>
        <GT name="User.Number" value="133" />
    </OR>
</FILTER>
Filtret i exemplet ovan anger att antingen ska User.Name vara lika med ”kalle anka” samt att User.Category ska vara något av följande värden a, b eller c, eller så ska User.Number vara större än 133.Ofta är bara en delmängd av data intressant, då är det önskvärt att bara få det aktuella datat med i svaret. Därför är det möjligt att ange vilka datafält som ska returneras, alternativt inte returneras.
<INCLUDE/> - anger ett datafält som ska inkluderas i svaret. Datafält som inte finns definierade kommer att exkluderas i svaret. INCLUDE-elementet kan förekomma inga, en eller många gånger. Elementets innehåll definierar datafältet. Fält som det görs sortering på (d.v.s. finns angivna i QUERY-attributet orderby) kommer också att inkluderas.
Exempel:
<QUERY objecttype="SomeObjectType" schemaversion="SomeSchemaVersion">
    <INCLUDE>WantedField</INCLUDE>
    <INCLUDE>WantedField2</INCLUDE>
</QUERY>
<EXCLUDE/> - anger ett datafält som ska exkluderas i svaret. Datafält som inte finns definierade kommer att inkluderas i svaret. EXCLUDE-elementet kan förekomma inga, en eller många gånger. Elementets innehåll definierar datafältet.
Exempel:
<QUERY objecttype="SomeObjectType" schemaversion="SomeSchemaVersion">
    <EXCLUDE>UnwantedField</EXCLUDE>
    <EXCLUDE>UnwantedField2</EXCLUDE>
</QUERY>
<DISTINCT/> - anger ett datafält vars unika värden ska returneras. Svaret innehåller en array med unika värden av det specificerade fältet. DISTINCT-elementet kan förekomma inga eller en gång. Elementets innehåll definierar datafältet.
Exempel:
<QUERY objecttype="SomeObjectType" schematversion="SomeSchemaVersion">
    <DISTINCT>DistinctField</DISTINCT>
</QUERY>
Enbart den ena av <INCLUDE/>, <EXCLUDE/> eller <DISTINCT/> kan av naturliga skäl defineras i en <QUERY/>.
Notera att alla attributvärden i datamodellen är skiftlägeskänsliga (case sensitive).
## Datum och tider
För att ange olika datum- och tidsangivelser i frågorna används följande två funktioner.
$now – nuvarande tidpunkt.
$dateadd(<timespan>) – där timespan är tiden som skall adderas till nuvarande tidpunkt.
En timespan definieras enligt d.hh:mm:ss (där ss är valfritt).
|  |  |
|---|---|
| - | Valfritt minus-tecken som indikerar en negativ tidsperiod. |
| d | Dagar, mellan 0 och 10675199. |
| hh | Timmar, mellan 0 och 23. |
| mm | Minuter, mellan 0 och 59. |
| ss | Sekunder, mellan 0 och 59. |
Exempel:
    Ett dygn: "1.00:00"
    En timme: "0.1:00"
    En minut: "0.00:01"
    En sekund: "0.00:00:01"
    Två dygn och 10 timmar och 15 minuter: "2.10:15"
    59 minuter: "0.00:59"
    60 minuter: "0.01:00"
    23 timmar: "0.23:00"
    24 timmar: "1.00:00"
Exempel på $dateadd-metoden som ger nuvarande tidpunkt minus 15min.
Exempel:
<GT name='AnnonseradTid' value='$dateadd(-0.00:15:00)' />

## Funktioner
För att kunna köra beräkningar i APIet kan man exekvera funktioner från förbestämda funktionsbibliotek. Detta kan vara användbart då man skall göra beräkningar på informationsobjekt i APIet. Syntaxen för att exekvera funktioner i frågan ser ut enligt nedan:
<REQUEST>
  <LOGIN authenticationkey="SomeAuthenticationKey" />
  <QUERY objecttype="SomeObjectType" schemaversion="SomeSchemaVersion" >
    <FILTER>
      <GT name="DataField" value="$function.SomeLib_v1.SomeMethod(param1, param2)" />
    </FILTER>
  </QUERY>
</REQUEST>
I ovanstående exempel körs metoden SomeMethod med parametrarna param1 och param2 i funktionsbiblioteket SomeLib_v1. Resultatet från metoden används sedan som value i GT operatorn.
EVAL
Vill man se resultatet från ett funktionsanrop kan man evaluera det genom att köra EVAL kommandot. EVAL operatorn har två attribut:
|  |  |
|---|---|
| alias | anger valfritt alias för funktionsanropet, visas tillsammans med funktionens resultat. |
| function | funktionsanropet man vill evaluera. |
Exempel:
<REQUEST>
    <LOGIN authenticationkey="SomeAuthenticationKey" />
    <QUERY objecttype="SomeObjectType" schemaversion="SomeSchemaVersion">
        <EVAL alias="MyFirstFunctionResult" function="$function.SomeLib_v1.SomeMethod(1238, FF)" />
    </QUERY>
</REQUEST>
Resultatet från evalueringen returneras i INFO-elementet som en array av EVALRESULT
<RESPONSE>
    <RESULT>
        <INFO>
            <EVALRESULT>
                <MyFirstFunctionResult>1337</MyFirstFunctionResult>
            </EVALRESULT>
        </INFO>
    </RESULT>
</RESPONSE>

Funktionsbibliotek i APIet

PMS_v1
APIet erbjuder funktionsbiblioteket PMS_v1 där följande metoder är implementerade:
$function.PMS_v1.CalcContinousLengthFromCoordinate(<County>, <RoadMainNumber>, <RoadSubNumber>, <Direction.Code>, <Easting>, <Northing>)
Returnerar ContinousLength för angiven punkt på angiven väg. Punkten anges i koordinatsystemet SWEREF99TM.
$function.PMS_v1.CalcContinousLengthsFromCoordinates(<County>, <RoadMainNumner>, <RoadSubNumber>, <Direction.Code>, [{<Easting>, <Northing>}, {<Easting>, <Northing>}, {<Easting>, <Northing>} ...])
Returnerar en kommaseparerad lista med ContinousLengths för angivna punkter på angiven väg. Punkterna anges i koordinatsystemet SWEREF99TM.
$function.PMS_v1.CalcCoordinateFromContinousLength(<County>, <RoadMainNumner>, <RoadSubNumber>, <Direction.Code>, <ContinousLength>)
Returnerar koordinater för anvigen ContinousLength på angiven väg. Koordinaterna returneras i koordinatsystemet SWEREF99TM.
$function.PMS_v1.CalcCoordinatesFromContinousLengths(<County>, <RoadMainNumner>, <RoadSubNumber>, <Direction.Code>, [<ContinousLength>, <ContinousLength>, <ContinousLength> ...])
Returnerar en kommaseparerad lista med koordinater för angivna ContinousLengths på angiven väg. Koordinaterna returneras i koordinatsystemet SWEREF99TM.
Funktionsbiblioteket PMS_v1 kan endast exekveras på datatyperna
* MeasurementData20
* MeasurementData100
* PavementData
* RoadData

⠀
TrainAnnouncement_v1
$function.TrainAnnouncement_v1.GetLocationsForTrain(<AdvertisedTrainIdent>, <ScheduledDepartureDateTime>)
Returnerar en kommaseparerad lista med signaturerna för de annonserade platser aktuellt tåg passerar.
Exempelanvändning:
<REQUEST>
    <LOGIN authenticationkey="YourAPIKey"/>
    <QUERY runtime="true" objecttype="TrainStation" schemaversion="1">
        <FILTER>
            <IN name="LocationSignature" value="$function.TrainAnnouncement_v1.GetLocationsForTrain(91,2019-10-31)" />
        </FILTER>
    </QUERY>
</REQUEST>
Funktionsbiblioteket TrainAnnouncement_v1 kan endast exekveras på datatyperna:
* TrainAnnouncement
* TrainStation
* TrainMessage

⠀Vägdata_v1.SnapToRoadNetWork
Nätankytningsfunktionen i APIet heter vägdata_v1.SnapToRoadNetWork och tar koordinatvärden som första två parametrarna och som optional parameter finns styrande attribut. Man kan även begränsa max-avstånd till med parametern MaxDistance, MaxDistance tar ett heltal mellan 1 och 500.
Anropet (se exempel nedan) nedan använder nätanknytningsfunktionen i APIet tre gånger.
1 Knyter mot vägnummer 574
2 Knyter mot något vägnummer, det vill säga oftast statlig väg
3 Knyter mot närmaste länk, oavsett vägtrafiknät.

⠀Exempel:
Frågan
<REQUEST>
    <LOGIN authenticationkey=" "/>
    <QUERY objecttype="Vägnummer" namespace="Vägdata.NVDB_DK_O" schemaversion="1.2" limit="1">
        <INCLUDE>
          GID
        </INCLUDE>
        <EVAL alias="Knyter mot vägnummer 574" function="$function.vägdata_v1.SnapToRoadNetwork(317945, 6422265,Vägnummer.Huvudnummer=574)" />

        <EVAL alias="Knyter mot vägnummer" function="$function.vägdata_v1.SnapToRoadNetwork(317945, 6422265,Vägnummer.Huvudnummer)" />

        <EVAL alias="Närmaste länk" function="$function.vägdata_v1.SnapToRoadNetwork(317945.1, 6422265.4)" />
    </QUERY>
</REQUEST>
Svaret
{
    "RESPONSE": {
        "RESULT": [
            {
                "Vägnummer": [
                    {
                        "GID": 2356317
                    }
                ],
                "INFO": {
                    "EVALRESULT": [
                        {
                            "Knyter mot vägnummer 574": {
                                "Pid": "1000",
                                "Sid": "42652",
                                "Element_Id": "1000:42652",
                                "Offset": "0.9409945472802244",
                                "Geometry": "POINT (317816.7280779326 6422194.88999661)"
                            }
                        },
                        {
                            "Knyter mot vägnummer": {
                                "Pid": "1000",
                                "Sid": "44095",
                                "Element_Id": "1000:44095",
                                "Offset": "0.17423962408110005",
                                "Geometry": "POINT (317946.3666782711 6422270.798388661)"
                            }
                        },
                        {
                            "Närmast länk": {
                                "Pid": "11157",
                                "Sid": "360016",
                                "Element_Id": "11157:360016",
                                "Offset": "0.9002677695525093",
                                "Geometry": "POINT (317943.5593317605 6422266.19948746)"
                            }
                        }
                    ]
                }
            }
        ]
    }
}

Hur använda svaret
När man fått nätanknytningssvaret, som exempel ”Närmaste länk”, se nedan
{
    "Närmast länk": {
        "Pid": "11157",
        "Sid": "360016",
        "Element_Id": "11157:360016",
        "Offset": "0.9002677695525093",
        "Geometry": "POINT (317943.5593317605 6422266.19948746)"
    }
}
Nu har man information för att ställa andra frågor.
Man kan med geometrin rita ut en punkt i en karta för att se att man snappat på den länk man vill.
Fråga efter referenslänk
Man kan använda Element_Id för att hitta referenslänken (LinkSequence i APIet) och visa upp den i en karta.
<REQUEST>
  <LOGIN authenticationkey=""/>
  <QUERY objecttype="LinkSequence" namespace="vägdata" schemaversion="1.2" limit="10">
    <FILTER>
      <and>
        <EQ name="Element_Id" value="11157:360016" />
      </and>
    </FILTER>
  </QUERY>
</REQUEST>

Fråga efter företeelser
Man kan använda Element_Id och Offset för att hitta rätt referenslänkdel (Link i APIet), Väghållare eller andra företeelsetyper.
Exempel nedan för Link, Väghållare och Vägtrafiknät:
<REQUEST>
  <LOGIN authenticationkey=""/>
  <QUERY objecttype="Link" namespace="vägdata" schemaversion="1.2" limit="10">
    <FILTER>
      <and>
        <EQ name="Element_Id" value="11157:360016" />
        <LTE name="Start_Measure" value="0.9002677695525093" />
        <GT name="End_Measure" value="0.9002677695525093" />
      </and>
    </FILTER>
  </QUERY>
  <QUERY objecttype="Väghållare" namespace="vägdata.nvdb_dk_o" schemaversion="1.2" limit="10">
    <FILTER>
      <and>
        <EQ name="Element_Id" value="11157:360016" />
        <LTE name="Start_Measure" value="0.9002677695525093" />
        <GT name="End_Measure" value="0.9002677695525093" />
      </and>
    </FILTER>
  </QUERY>
  <QUERY objecttype="Vägtrafiknät" namespace="vägdata.nvdb_dk_o" schemaversion="1.2" limit="10">
    <FILTER>
      <and>
        <EQ name="Element_Id" value="11157:360016" />
        <LTE name="Start_Measure" value="0.9002677695525093" />
        <GT name="End_Measure" value="0.9002677695525093" />
      </and>
    </FILTER>
  </QUERY>
</REQUEST>

Fråga med nätanknytningsfunktionen direkt i filtret
Man kan även använda nätanknytningsfunktionen direkt i filtret
Exempel:
<REQUEST>
  <LOGIN authenticationkey="Fyll i egen här "/>
  <QUERY objecttype="Vägnummer" namespace="vägdata.nvdb_dk_o" schemaversion="1.2" limit="1">
    
    <FILTER>
      <and>
        <EQ name="Element_Id" value="$function.vägdata_v1.SnapToRoadNetwork(317945, 6422265,Vägnummer.Huvudnummer).Element_Id" />
        <LTE name="Start_Measure" value="$function.vägdata_v1.SnapToRoadNetwork(317945, 6422265,Vägnummer.Huvudnummer).Offset" />
        <GT name="End_Measure" value="$function.vägdata_v1.SnapToRoadNetwork(317945, 6422265,Vägnummer.Huvudnummer).Offset" />
      </and>
    </FILTER>
  </QUERY>
</REQUEST>

Beskrivning av parametrarna för funktion vägdata_v1.SnapToRoadNetwork
Parameter 1 - EastWest (Y)
Värde för EastWest i koordinaten Obligatorisk
Parameter 2 - NorthSouth (X)
Värde för NorthSouth i koordinaten Obligatorisk
Parameter 3 - Styrande attribut
Valfri, ett styrande attribut kan användas i en fråga. Följande styrande attribut kan användas Vägnummer.Huvudnummer - om värde anges är det exakt det vägnumret som nätknytning görs mot, annars knyts mot länkar som har vägnummer.huvudnummer (oftast statlig väg).
Vägnummer
* Europaväg
* Huvudnummer
* Element_Id

⠀Väghållare
* Väghållartyp
* Väghållarnamn
* Element_Id

⠀Antalkörfält2
* Körfältsantal
* Körfält_I_Vägens_Framriktning
* Körfält_I_vägens_Bakriktning
* Element_Id

⠀Vägtrafiknät
* Nättyp
* Element_Id

⠀Link
* Element_Id

⠀Paramenter 4 - MaxDistance
Valfri, MaxDistance anger hur långt från länken en godkänd nätanknytning skall kunna utföras. Den kan anges mellan 1 - 500 meter, om den inte anges gäller 500 meter. Om man anger ett värde högre än 500 meter får man ett felmeddelande från APIet .
Funktionsbiblioteket vägdata_v1.SnapToRoadNetwork kan exekveras på alla datatyper i APIet.
## Geo-sökningar
Geo-fält är definierade som ~[WKT](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry)~ t.ex. <SWEREF99TM>POINT(674707 6579684)</SWEREF99TM>. De fält som det är möjligt att ställa geo-frågor mot är i datamodellen markerade med en symbol. För tillfället finns stöd för följande geo-operatorer.
Within
Med operatorn <WITHIN> finns det stöd för att fråga efter huruvida ett objekt helt befinner sig inom en box, polygon eller inom en radie. Attributet shape kan ha tre olika värden, så här kan respektive fråga se ut:
Box value="nedre vänster hörn, övre höger hörn"
<REQUEST>
    <LOGIN authenticationkey="SomeAuthenticationKey" />
    <QUERY objecttype="SomeObjectType" schemaversion="SomeSchemaVersion">
    <FILTER>
      <WITHIN name="Geometry.SWEREF99TM" shape="box" value="276192 6576098, 280967 6579969"/>
    </FILTER>
  </QUERY>
</REQUEST>
Polygon value="en stängd polygon"
Notering: ange en stängd polygon, det görs genom att den första och den sista punkten har samma värde.
<REQUEST>
  <LOGIN authenticationkey="SomeAuthenticationKey" />
  <QUERY objecttype="SomeObjectType" schemaversion="SomeSchemaVersion">
    <FILTER>
      <WITHIN name="Geometry.SWEREF99TM" shape="polygon"
        value="343221.595823 6473809.616383,343065.083445 6473844.341895,
               343285.880000 6473971.780000,343221.595823 6473809.616383" />
    </FILTER>
  </QUERY>
</REQUEST>
Center value="en mittpunkt", radius="radie i enhet för aktuellt referenssystem".
<REQUEST>
  <LOGIN authenticationkey="SomeAuthenticationKey" />
  <QUERY objecttype="SomeObjectType" schemaversion="SomeSchemaVersion">
    <FILTER>
      <WITHIN name="Geometry.SWEREF99TM" shape="center"
                value="343207 6473960" radius="100" />
    </FILTER>
  </QUERY>
</REQUEST>
Standardenhet för SWEREF99TM är meter, men för WGS84 är det grader. Om man hellre vill ange radien i meter för WGS84-geometrier görs detta genom att suffixa radien med ett m. Exempel: <WITHIN name="Geometry.WGS84" shape="center" value="15.42 60.48" radius="500m" />. Anger man inte detta suffix ställs frågan med enheten i grader. Nedan följer några exempel på within mellan geometrier och dess resultat.
| Match | Miss |
![](685a689b333be0c34d540201.png)
![](685a689b333be0c34d5401fb.png)
![](685a689b333be0c34d5401fd.png)
![](685a689b333be0c34d5401f9.png)
![](685a689b333be0c34d5401ff.png)|---|---|
  |
Intersects
Operatorn <INTERSECTS> används för att få reda på om två geometrier har en gemensam punkt, den används på samma sätt som operatorn <WITHIN>. Nedan följer några exempel på intersect mellan geometrier och dess resultat.
| Match | Miss |
![](685a689b333be0c34d540201_2.png)
![](685a689b333be0c34d5401fb_2.png)
![](685a689b333be0c34d5401ff_2.png)
![](685a689b333be0c34d5401f9_2.png)
![](685a689b333be0c34d5401fd_2.png)|---|---|
  |
Near
Operatorn <NEAR> används för att avgöra om en geometri finns i närheten av en punkt och har attributen value='En punkt' mindistance='Minimalt avstånd en geometri får vara från punkten' och maxdistance='Maximalt avstånd en geometri får vara från punkten', där avståndet alltid anges i meter. Svaret returneras alltid i ordning där den närmsta träffen kommer först, oavsett vad som anges i orderby. Se följande exmpel:
<REQUEST>
  <LOGIN authenticationkey="SomeAuthenticationKey" />
  <QUERY objecttype="SomeObjectType" schemaversion="SomeSchemaVersion">
    <FILTER>
        <NEAR name="Geometry.SWEREF99TM" value="353855 6423240" mindistance="1" maxdistance="20" />
    </FILTER>
  </QUERY>
</REQUEST>
## Förändrat data
Om ett visst data uppdateras ofta vill man också kontrollera datat ofta. Datamängden som hämtas vid varje förfrågan ska dock vara så liten som möjligt. En tillämpning som hämtar data ofta, trots att inga förändringar i datat gjorts, är felaktigt designad. Det är önskvärt att bara hämta de dataposter som har förändrats sedan förra gången samma datamängd efterfrågades.
Alla dataposter i APIet har ett unikt löpnummer som gör det möjligt att hämta alla förändringar som skett sedan förra hämtningen. Om man i frågan anger att man vill ha alla förändringar som är större än ett specificerat löpnummer (changeid) returneras alla poster som uppfyller filtret och har ett löpnummer som är större än det man angivit i changeid.
Initialt börjar man att specificera changeid="0" tillsammans med ett filter för att hämta de första dataposterna. Vid svaret returneras all data som uppfylls av filtret tillsammans med ett info-element som innehåller senaste changeid (LASTCHANGEID). Värdet i LASTCHANGEID används sedan i nästa fråga för att ange efter vilket changeid man vill ha data. Man får då endast förändringarna efter förra gången man hämtat data.
Notering: Använd ingen orderby i kombination med changeid i den initiala frågan, resultatet är redan sorterat i sekventiell ordning enligt changeid.
Görs en sådan hämtning så är det inte enbart förändrade dataposter som är av intresse utan även de dataposter som raderats sedan förra hämtningen. Normalt sett returneras inte borttagna poster men genom att lägga till attributet includedeletedobjects till QUERY-elementet i frågan så kommer även borttagna dataposter att returneras i svaret. Raderade dataposter finns kvar i systemet i 24 timmar efter borttag. Borttagna dataposter innehåller datafältet Deleted=true.
Följande fråga returnerar alla dataposter av typen SomeObjectType som uppdaterats eller raderats efter 2018-06-01T00:00:00.00.
Fråga:
<REQUEST>
  <LOGIN authenticationkey="SomeAuthenticationKey" />
  <QUERY objecttype="SomeObjectType" schemaversion="SomeSchemaVersion" includedeletedobjects="true"
    changeid="0">
  <FILTER>
    <AND>
      <GT name="VersionField" value="2018-06-01T00:00:00.00" />
      <EQ name="DataField" value="SomeData" />
    </AND>
  </FILTER>
  </QUERY>
</REQUEST>
Svar:
<RESPONSE>
  <RESULT>
    <SomeObjectType>
      <Id>123</Id>
      <DataField>SomeData</DataField>
      <VersionField>2018-06-01T00:01:12.256</VersionField>
    </SomeObjectType>
    <SomeObjectType>
      <Id>456</Id>
      <DataField>SomeData</DataField>
      <VersionField>2018-06-01T00:02:21.196Z</VersionField>
      <Deleted>true</Deleted>
    </SomeObjectType>
    <INFO>
       <LASTCHANGEID>6678036140773081527</LASTCHANGEID>
    </INFO>
  </RESULT>
</RESPONSE>
Genom att attributet changeid angavs i QUERY-elementet så returnerades även det största unika löpnumret ( LASTCHANGEID ) i datat som returnerades.
Nu har alla förändringar mottagits. Nästa gång en fråga ställs för att få dataförändringar kan frågan ändras så att det är uppdateringar eller borttag gjorda efter det returnerade LASTCHANGEID (6678036140773081527) som önskas.
<REQUEST>
  <LOGIN authenticationkey="SomeAuthenticationKey" />
  <QUERY objecttype="SomeObjectType" schemaversion="SomeSchemaVersion" includedeletedobjects="true"
    changeid="6678036140773081527">
    <FILTER>
      <EQ name="DataField" value="SomeData" />
    </FILTER>
  </QUERY>
</REQUEST>
## Content-type
Från och med version 2 måste POST-anropet ha någon av följande värde i Content-Type headern:
* application/xml
* text/xml
* text/plain (triggar ingen CORS preflight, mer info finns ~[här](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests)~.)

⠀CORS
Normalt sett så får en webbläsare av säkerhetsskäl inte göra ett XMLHttpRequest till en annan domän (cross-domain) än den som sidan ursprungligen laddades ifrån. Cross-origin resource sharing (CORS) är en mekanism för att tillåta just detta. Trafikverkets öppna API för trafikinformation har stöd för CORS. Om användarens webbläsare har stöd för CORS kommer en Origin HTTP header att bifogas anropet och webbservicen kommer i svarets header att returnera Access-Control-Allow-Origin: *.
~[Läs mer om CORS här](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing)~