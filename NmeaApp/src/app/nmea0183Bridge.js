"use strict";

/*
20231210 Checked against signalk NMEA0183 parser and verified.
*/

class NMEA0183Bridge {

    constructor() {
        this.storeSentenceValues = {};
        this.variation = 0;
    }

    /**
     * Generates a minimal set of NMEA0183 sentences for the TCP sever.
     * Calcultions also performs updates
     */ 
    update(message, nmea0183Handler) {
        try {
            switch(message.pgn) {
                case 126992: // System time
                    // Use GNSS message
                    //if ( message.timeSource === NMEA2000Reference.lookupByValue.timeSource.GPS) {
                    //    newState.systemDate = message.systemDate;
                    //    newState.systemTime = message.systemTime;
                    //}
                    break;
                case 127250: // Heading

/*
NKE
Heading magnetic:
$IIHDG,x.x,,,,*hh
 I_Heading magnetic
$IIHDM,x.x,M*hh
 I__I_Heading magnetic 

Heading true:
$IIHDT,x.x,T*hh
 I__I_Heading true 
*/
                    if ( message.ref.name === "Magnetic") {
                        this.setStore("headingMagnetic", this.limitDegrees((message.heading*180/Math.PI),0,360), 1);
                        this.setStore("headingTrue", this.limitDegrees((message.heading-message.variation)*180/Math.PI), 1);
                        this.setStore("variation", Math.abs(message.variation*180/Math.PI), 1);
                        this.variation = message.variation;
                        this.storeSentenceValues.variationEw = message.variation>=0?"E":"W";
                        nmea0183Handler.updateSentence('IIHDG', ['$IIHDG',
                                                    (message.heading*180/Math.PI).toFixed(1),
                                                    (Math.abs(message.deviation*180/Math.PI)).toFixed(1),
                                                    message.deviation>=0?"E":"W",
                                                    this.storeSentenceValues.variation,
                                                    this.storeSentenceValues.variationEw]);
                        nmea0183Handler.updateSentence('IIHDM', ['$IIHDM',
                                                    this.storeSentenceValues.headingMagnetic,
                                                    'M']);
                        nmea0183Handler.updateSentence('IIHDT', ['$IIHDT',
                                                    this.storeSentenceValues.headingTrue,
                                                    'T']);
                        
                    }
                    break;
                case 127257: // attitude
                    nmea0183Handler.updateSentence('IIXDRROLL', ['$IIXDR',
                                                "A",
                                                (message.roll*180/Math.PI).toFixed(1),
                                                "D",
                                                "ROLL"]);
                    break;
                case 127258: // variation
                    // Use heading message
                    //newState.variationValue = message.variation;
                    //newState.variationdaysSince1970 = message.daysSince1970;
                    //newState.variationModel = NMEA2000Reference.reference.variationSource[message.source].name;
                    break;
                case 128259: // water speed
/*NKE definition
$IIVHW,x .x,T,x.x,M,x.x,N,x.x,K*hh
          | |   | |   | |   |-|_Surface speed in kph
          | |   | |   |-|-Surface speed in knots
          | |   |-|-Magnetic compass heading
          |-|-True compass heading
*/
                    nmea0183Handler.updateSentence('IIVHW', ['$IIVHW',
                                        // heading true
                                                    this.storeSentenceValues.headingTrue || '',
                                                    'T',
                                                    this.storeSentenceValues.headingMagnetic || '',
                                                    'M',
                                                    (message.waterReferenced*1.94384617179).toFixed(2),
                                                    'N',
                                                    (message.waterReferenced*3.6).toFixed(2),
                                                    'K']);
                    break;
                case 128267: // depth
/*
NKE definitions
$IIDPT,x.x,x.x,,*hh
         I   I_Sensor offset, >0 = surface transducer distance, >0 = keel transducer distance.
         I_Bottom transducer distance
$IIDBT,x.x,f,x.x,M,,*hh
         I I  I__I_Depth in metres
         I_I_Depth in feet 

         Looks ok.
 */
                    nmea0183Handler.updateSentence('IIDBT', ['$IIDBT',
                                                    (message.depthBelowTransducer*3.28084).toFixed(1),
                                                    'f',
                                                    (message.depthBelowTransducer).toFixed(1),
                                                    'M',
                                                    (message.depthBelowTransducer*0.546807).toFixed(1),
                                                    'F']);
                    nmea0183Handler.updateSentence('IIDPT', ['$IIDPT',
                                                    (message.depthBelowTransducer).toFixed(2),
                                                    (message.offset).toFixed(2)]);
                    break;
                case 128275: // log

/*
NKE definition
Total log and daily log:
$IIVLW,x.x,N,x.x,N*hh
 I I I__I_Daily log in miles
 I__I_Total log in miles 
*/
                    nmea0183Handler.updateSentence('IIVLW', ['$IIVLW',
                                                    (message.log*0.000539957).toFixed(2),
                                                    'N',
                                                    (message.tripLog*0.000539957).toFixed(2),
                                                    'N']);
                    break;
                case 129029: // GNSS
                    {
                        const nmeaTime = this.toNmeaTime(message.secondsSinceMidnight);
                        const nmeaLatitude = this.toNmeaLatitude(message.latitude);
                        const nmeaLongitude = this.toNmeaLongitude(message.longitude);
                        const nmeaDate = this.toNmeaDate(message.daysSince1970);
                        this.setStore('faaValid', message.integrety.name==="Safe"?'A':'V' );

                        /*
                        GNSS Message  {
      pgn: 129029,
      message: 'N2K GNSS',
      sid: 1,
      daysSince1970: 18973,
      secondsSinceMidnight: 56,
      latitude: 60.43661498999972,
      longitude: 22.23781967099986,
      altitude: 1.0498048e-9,
      GNSStype: { id: 0, name: 'GPS' },
      GNSSmethod: { id: 1, name: 'GNSSfix' },
      integrety: { id: 1, name: 'Safe' },
      nSatellites: 12,
      hdop: NaN,
      pdop: NaN,
      geoidalSeparation: 15,
      nReferenceStations: 1,
      stations: [
        {
          referenceStationType: [Object],
          referenceSationID: 3840,
          ageOfCorrection: 51200
        }
      ]
    }
    */


                        nmea0183Handler.updateSentence('IIGGA', ['$IIGGA',

                            //UTC of this position report, hh is hours, mm is minutes, ss.ss is seconds.
                                                        nmeaTime.utc,
                                                        nmeaLatitude.value,
                                                        nmeaLatitude.ns,
                                                        nmeaLongitude.value,
                                                        nmeaLongitude.ew,
                                                        message.GNSSmethod.id,
                                                        this.toFixed(message.nSatellites, 0),
                                                        this.toFixed(message.hdop, 2),
                                                        this.toFixed(message.altitude, 0),
                                                        "M",
                                                        this.toFixed(message.geoidalSeparation, 0),
                                                        "M",
                                                        '',
                                                        '']);



/*
NKE
Geographical position, latitude and longitude:
$IIGLL,IIII.II,a,yyyyy.yy,a,hhmmss.ss,A,A*hh
             I I        I I         I I_Statut, A= valid data, V= non valid data
             I I        I I         I_UTC time
             I I        I_I_Longitude, E/W
             I_I_Latidude, N/S                  

// not sure about AA at the end. A works withthe NKE app.     
*/
                              nmea0183Handler.updateSentence('IIGLL', ['$IIGLL',
                            //UTC of this position report, hh is hours, mm is minutes, ss.ss is seconds.
                                                        nmeaLatitude.value,
                                                        nmeaLatitude.ns,
                                                        nmeaLongitude.value,
                                                        nmeaLongitude.ew,
                                                        nmeaTime.utc,
                                                        this.storeSentenceValues.faaValid,
                                                        this.storeSentenceValues.faaValid]);
/*
NKE
UTC time and date:
$IIZDA,hhmmss.ss,xx,xx,xxxx,,*hh
 I I I I_Year
 I I I_Month
 I I_Day
 I_Time
*/
                        nmea0183Handler.updateSentence('IIZDA', ['$IIZDA',
                                                        nmeaTime.utc,
                                                        nmeaDate.d,
                                                        nmeaDate.m,
                                                        nmeaDate.y,
                                                        nmeaTime.tzOffsetHours,
                                                        nmeaTime.tzOffsetMinutes]);

                        nmea0183Handler.updateSentence('IIRMC', ['$IIRMC',
                                                        nmeaTime.utc,
                                                        this.storeSentenceValues.faaValid,
                                                        nmeaLatitude.value,
                                                        nmeaLatitude.ns,
                                                        nmeaLongitude.value,
                                                        nmeaLongitude.ew,
                                                        this.storeSentenceValues.sog || '',
                                                        this.storeSentenceValues.cogt || '',
                                                        nmeaDate.ddmmyy,
                                                        this.storeSentenceValues.variation|| '',                                                
                                                        this.storeSentenceValues.variationEw || '']);
                    }
                    break;
                case 129026: // sog cog rapid

                    if ( message.ref.name === "True" ) {

/*
NKE
Ground heading and speed:
$IIVTG,x.x,T,x.x,M,x.x,N,x.x,K,A*hh
         I I   I I   I I   I_I_Bottom speed in kph
         I I   I I   I_I_Bottom speed in knots
         I I   I_I_Magnetic bottom heading
         I_I_True bottom heading 

seems to work ok without the additional A (probably the FAA field)
*/
                        // cog is true
                        this.setStore("cogt",this.limitDegrees(message.cog*180/Math.PI,0,360), 1);
                        this.setStore("cogm",this.limitDegrees((message.cog+this.variation)*180/Math.PI,0,360), 1);
                        this.setStore("sog", (message.sog*1.94384617179), 2);
                        nmea0183Handler.updateSentence('IIVTG', ['$IIVTG',
                            this.storeSentenceValues.cogt ,
                            'T',
                            this.storeSentenceValues.cogm,
                            'M',
                            this.storeSentenceValues.sog,
                            'N',
                            this.toFixed((message.sog*3.6), 2),
                            'K',
                            this.storeSentenceValues.faaValid || 'V']);
                    }
                    break;
                case 129283: // XTE
/*
NKE
 Cross-track error:
 $IIXTE,A,A,x.x,a,N,A*hh
 I_Cross-track error in miles, L= left, R= right 
 Appears to work with A
*/
                    nmea0183Handler.updateSentence('IIXTE', ['$IIXTE',
                        'A','A',
                        this.toFixed((message.xte*0.000539957), 3),
                        message.xte>=0?"L":"R",
                        'N',
                        this.storeSentenceValues.faaValid || 'V']);
                    break;
                case 130306: // wind

/*
NKE definitions.
Apparent wind angle and speed:
$IIVWR,x.x,a,x.x,N,x.x,M,x.x,K*hh
         I I   I I   I I   I_I_Wind speed in kph
         I I   I I   I_I_Wind speed in m/s
         I I   I_I_Wind speed in knots
         I_I_Apparent wind angle from 0° to 180°, L=port, R=starboard 


$IIVWT,x.x,a,x.x,N,x.x,M,x.x,K*hh
         | |   | |   | |   | |  Wind speed in kph
         | |   | |   | |------- Wind speed in m/s
         | |   | |------------- I_Wind speed in knots
         | |------------------- True wind angle from 0° to 180°, L=port, R=starboard 

Also need MWV sentence

$IIMWV,x.x,a,x.x,N,a*hh
         | |   | | |-------- Valid A, V = invalid. 
         | |   | |---------- Wind speed In knots
         | |---------------- Reference, R = Relative, T = True
         |------------------ Wind Angle, 0 to 359 degrees

*/

                    var relativeAngle = this.limitDegrees(message.windAngle*180/Math.PI, -180, 180);
                    var dir = "R";
                    if ( relativeAngle < 0 ) {
                        relativeAngle = -relativeAngle;
                        dir = "L";
                    }


                    if (message.windReference.name === "Apparent" ) {

                        nmea0183Handler.updateSentence('IIVWR', ['$IIVWR',
                            this.toFixed(relativeAngle, 1),
                            dir,
                            this.toFixed((message.windSpeed*1.94384617179), 1),
                            'N',
                            this.toFixed((message.windSpeed), 1),
                            'M',
                            this.toFixed((message.windSpeed*3.6), 1),
                            'K']);
                        nmea0183Handler.updateSentence('IIMWVA', ['$IIMWV',
                            this.toFixed(relativeAngle, 1),
                            'R',
                            this.toFixed((message.windSpeed*1.94384617179), 1),
                            'N',
                            'A']);
                    } else if (message.windReference.name === "True" ) {

                        nmea0183Handler.updateSentence('IIVWT', ['$IIVWT',
                            this.toFixed(relativeAngle, 1),
                            dir,
                            this.toFixed((message.windSpeed*1.94384617179), 1),
                            'N',
                            this.toFixed((message.windSpeed), 1),
                            'M',
                            this.toFixed((message.windSpeed*3.6), 1),
                            'K']);
                        nmea0183Handler.updateSentence('IIMWVA', ['$IIMWV',
                            this.toFixed(relativeAngle, 1),
                            'T',
                            this.toFixed((message.windSpeed*1.94384617179), 1),
                            'N',
                            'A']);
                    }
                    break;
                case 127506: // DC Status
                    // ignore for now, may be able to get from LifePO4 BT adapter
                    break;
                case 127508: // DC Bat status
                    break;
                case 130312:
                    break;
                case 127505: // fluid level
                    break;
                case 127489: // Engine Dynamic params
                    break;
                case 127488: // Engine Rapiod
                    break;
                case 130314: // pressure
/*
NKE
$IIMMB,x.x,I,x.x,B*hh
 I I I__I_Atmospheric pressure in bars
 I_ I_Atmospheric pressure in inches of mercury 
 TODO
*/

                    break;
                case 127245: // rudder

                    nmea0183Handler.updateSentence('IIRSA', ['$IIRSA',
                        this.toFixed((message.rudderPosition*180/Math.PI), 1),
                        'A',
                        '',
                        '']);
                    break;
            }
        } catch (e) {
            console.log("Processing message failed ", message, e);        
        }
    }


    updateCalculatedSentences(calculatedState, nmea0183Handler) {
        // If using a store of NMEA0183 messages, then update them
        // by default these are saved in the store which can be used to generate
        // NMEA0183 messages on demand.
        // for NKE instruments.
        if ( calculatedState.polarSpeed !== undefined ) {
            nmea0183Handler.updateSentence('PNKEP01', ['$PNKEP',
                                        '01',
                                        (calculatedState.polarSpeed*1.9438452).toFixed(2),
                                        'N',
                                        (calculatedState.polarSpeed*3.6).toFixed(2),
                                        'K'], calculatedState.lastCalc);                
        }
        if ( calculatedState.oppositeTrackMagnetic !== undefined ) {
            nmea0183Handler.updateSentence('PNKEP02', ['$PNKEP',
                                        '02',
                                        (calculatedState.oppositeTrackMagnetic*180/Math.PI).toFixed(2)
                                        ], calculatedState.lastCalc);                
        }
        if ( calculatedState.polarSpeed !==  undefined ) {
            nmea0183Handler.updateSentence('PNKEP03', ['$PNKEP',
                                        '03',
                                        (calculatedState.targetTwa*180/Math.PI).toFixed(2),
                                        (calculatedState.polarVmgRatio*100).toFixed(2),
                                        (calculatedState.polarSpeedRatio*100).toFixed(2)
                                        ], calculatedState.lastCalc);
            nmea0183Handler.updateSentence('PNKEP99', ['$PNKEP',   
                                        '99',
                                        (calculatedState.awa*180/Math.PI).toFixed(2),
                                        (calculatedState.aws*1.9438452).toFixed(2),
                                        (calculatedState.twa*180/Math.PI).toFixed(2),
                                        (calculatedState.tws*1.9438452).toFixed(2),
                                        (calculatedState.stw*1.9438452).toFixed(2),
                                        (calculatedState.polarSpeed*1.9438452).toFixed(2),
                                        (calculatedState.polarSpeedRatio*1.0).toFixed(3)], 
                                        calculatedState.lastCalc);

        }
        // for other instruments.
        if ( calculatedState.tws !== undefined ) {
            nmea0183Handler.updateSentence('MWVT', ['$IIMWV',
                        (calculatedState.twa*180/Math.PI).toFixed(2),
                        'T',
                        (calculatedState.tws*1.9438452).toFixed(2),
                        'K',
                        'A'], calculatedState.lastCalc);
        }
    }

    limitDegrees(v, l, h) {
        if ( v < l ) {
            return v+360;
        } else if ( v > h ) {
            return v-360;
        }
        return v;
    }

    setStore(key, v, p) {
        if ( v === undefined ) {
            this.storeSentenceValues[key] = '';
        } else if ( typeof v.toFixed ===  'function') {
            if ( !Number.isNaN(v) ) {
                this.storeSentenceValues[key] = v.toFixed(p);
            } else {
                console.log("Store ", key, v);
                this.storeSentenceValues[key] = '';
            }            
        } else {
            this.storeSentenceValues[key] = v;
        }
    }
    toFixed(v, p) {
        if ( v && !Number.isNaN(v)) {
            return v.toFixed(p);
        } else {
            return '';
        }
    }
    toNmeaTime(secondsSinceMidnight) {
        // hhmmss.ss
        const hh = Math.trunc(secondsSinceMidnight/3600);
        const mm = Math.trunc((secondsSinceMidnight-(hh*3600))/60);
        const ss =secondsSinceMidnight-(hh*3600)-(mm*60);
        const d = new Date();
        const tzOffset = d.getTimezoneOffset();
        const tzOffsetHours = Math.trunc(tzOffset/60);
        const tzOffsetMinutes = tzOffset - tzOffsetHours*60;
        return {
            utc: `${("00"+(hh).toFixed(0)).slice(-2)}${("00"+(mm).toFixed(0)).slice(-2)}${("00"+(ss).toFixed(2)).slice(-5)}`,
            tzOffsetHours,
            tzOffsetMinutes
        }
    }
    toNmeaLatitude(latitude) {
        //ddmm.mmmmm
        const ret = {
            ns: 'N'
        };
        let ddeg = latitude;
        if ( ddeg < 0 ) {
            ret.ns = 'S';
            ddeg = -ddeg;
        }
        const dd = Math.trunc(ddeg);
        const mm = (ddeg - dd)*60;
        ret.value = `${("000"+(dd.toFixed(0))).slice(-2)}${("00"+(mm.toFixed(4))).slice(-7)}`;
        return ret;
    }
    toNmeaLongitude(longitude) {
        // dddmm.mmmmm
        const ret = {
            ew: 'E'
        }
        let ddeg = longitude;
        if ( ddeg < 0 ) {
            ret.ew = 'W';
            ddeg = -ddeg;
        }
        const dd = Math.trunc(ddeg);
        const mm = (ddeg - dd)*60;
        ret.value = `${("000"+(dd.toFixed(0))).slice(-3)}${("00"+(mm.toFixed(4))).slice(-7)}`;
        return ret;
    }
    toNmeaDate(daysSince1970) { 
        const d = new Date(daysSince1970*3600000*24);
        const ret = {
            d: ("00"+(d.getDate()).toFixed(0)).slice(-2),
            m: ("00"+(d.getMonth()+1).toFixed(0)).slice(-2),
            y: (d.getYear()+1900).toFixed(0)
        }
        ret.ddmmyy = ret.d+ret.m+ret.y.slice(-2);
        return ret;
    }
}

module.exports =  { NMEA0183Bridge };
