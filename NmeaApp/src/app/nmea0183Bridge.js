"use strict";


class NMEA0183Bridge {

    constructor() {
        this.storeSentenceValues = {};
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
                    if ( message.ref.name === "Magnetic") {
                        this.setStore("headingMagnetic", (message.heading*180/Math.PI), 1);
                        this.setStore("variation", Math.abs(message.variation*180/Math.PI), 1);
                        this.storeSentenceValues.variationEw = message.variation>=0?"E":"W";
                        nmea0183Handler.updateSentence('IIHDG', ['$IIHDG',
                                                    (message.heading*180/Math.PI).toFixed(1),
                                                    (Math.abs(message.deviation*180/Math.PI)).toFixed(1),
                                                    message.deviation>=0?"E":"W",
                                                    this.storeSentenceValues.variation,
                                                    this.storeSentenceValues.variationEw]);

                        
                    }
                    break;
                case 127257: // attitude
/*
Not recognised: $IIXDR,A,7.8,L,ROLL*7f
*/
                    nmea0183Handler.updateSentence('IIXDRROLL', ['$IIXDR',
                                                "A",
                                                (Math.abs(message.roll*180/Math.PI)).toFixed(1),
                                                message.roll>=0?"R":"L",
                                                "ROLL"]);
                    break;
                case 127258: // variation
                    // Use heading message
                    //newState.variationValue = message.variation;
                    //newState.variationdaysSince1970 = message.daysSince1970;
                    //newState.variationModel = NMEA2000Reference.reference.variationSource[message.source].name;
                    break;
                case 128259: // speed
                    nmea0183Handler.updateSentence('IIVHW', ['$IIVHW',
                                        // heading true
                                                    '',
                                                    'T',
                                                    this.storeSentenceValues.headingMagnetic || '',
                                                    'M',
                                                    (message.waterReferenced*1.94384617179).toFixed(2),
                                                    'N',
                                                    (message.waterReferenced*3.6).toFixed(2),
                                                    'K']);
                    break;
                case 128267: // depth
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
                                                        nmeaTime,
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
                                                        "M"]);


                        console.log("message.integrety.name", message.integrety);
                        nmea0183Handler.updateSentence('IIGLL', ['$IIGLL',
                            //UTC of this position report, hh is hours, mm is minutes, ss.ss is seconds.
                                                        nmeaLatitude.value,
                                                        nmeaLatitude.ns,
                                                        nmeaLongitude.value,
                                                        nmeaLongitude.ew,
                                                        nmeaTime,
                                                        message.integrety.name==="Safe"?'A':'V']);
                        nmea0183Handler.updateSentence('IIZDA', ['$IIZDA',
                                                        nmeaTime,
                                                        nmeaDate.d,
                                                        nmeaDate.m,
                                                        nmeaDate.y]);

                        nmea0183Handler.updateSentence('IIRMC', ['$IIRMC',
                                                        nmeaTime,
                                                        message.integrety.name==="Safe"?'A':'V',
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
                        this.setStore("cogt",(message.cogt*180/Math.PI), 1);
                        this.setStore("cogm",((message.cogt+this.variation)*180/Math.PI), 1);
                        this.setStore("sog", (message.sog*1.94384617179), 2);
                        nmea0183Handler.updateSentence('IIVTG', ['$IIVTG',
                            this.storeSentenceValues.cogt ,
                            'T',
                            this.storeSentenceValues.cogm,
                            'M',
                            this.storeSentenceValues.sog,
                            'N',
                            this.toFixed((message.sog*3.6), 2),
                            'K']);
                    }
                    break;
                case 129283: // XTE
                    nmea0183Handler.updateSentence('IIXTE', ['$IIXTE',
                        'A','A',
                        this.toFixed((message.xte*0.000539957), 3),
                        message.xte>=0?"L":"R",
                        'N']);
                    break;
                case 130306: // wind

                    if (message.windReference.name === "Apparent" ) {
                        nmea0183Handler.updateSentence('IIMWVA', ['$IIMWV',
                            this.toFixed((message.windAngle*180/Math.PI), 1),
                            'R',
                            this.toFixed((message.windSpeed*1.94384617179), 1),
                            'N',
                            'A']);
                    } else if (message.windReference.name === "True" ) {
                        nmea0183Handler.updateSentence('IIMWVT', ['$IIMWV',
                            this.toFixed((message.windAngle*180/Math.PI), 1),
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
            console.log("Processing message failed ", message);        
        }
    }


    setStore(key, v, p) {
        if (v !== undefined && !Number.isNaN(v) ) {
            this.storeSentenceValues[key] = v.toFixed(p);
        } else {
            console.log("Store ", key, v);
            this.storeSentenceValues[key] = '';
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
        return `${("00"+(hh).toFixed(0)).slice(-2)}${("00"+(mm).toFixed(0)).slice(-2)}${("00"+(ss).toFixed(2)).slice(-5)}`;

    }
    toNmeaLatitude(latitude) {
        //ddmm.mmmmm
        const ret = {
            ns: 'N'
        };
        let ddeg = latitude*180/Math.PI;
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
        let ddeg = longitude*180/Math.PI;
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
