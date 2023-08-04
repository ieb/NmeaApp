"use strict;"
const { SerialPort } = require('serialport');
const { argv } = require('node:process');


const devicePath = argv[2] || '/dev/cu.usbserial-A50285BI';
const baudRate = parseInt(argv[3] || '9600');
console.log(`${devicePath} at ${baudRate}`);

function boxMullerTransform() {
    const u1 = Math.random();
    const u2 = Math.random();
    
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    
    return { z0, z1 };
}

function getNormallyDistributedRandomNumber(mean, stddev) {
    const { z0, _ } = boxMullerTransform();
    
    return z0 * stddev + mean;
}



var awa = 34;
var aws = 10.0;
var hdm = 45;
var stw = 6.0;
var sog = 6.0;
var variation = 1.0;
var roll = 15.0;
var cogt = 10.0;
var latitude = 52.179921;
var longitude = 0.1255688;

function fix180(x) {
    while ( x > 180 ) x = x - 360;
    while ( x < -180) x = x + 360;
    return x;
}
function fix360(x) {
    while ( x > 360 ) x = x - 360;
    while ( x < 0) x = x + 360;
    return x;
}

function createSentence(fields) {
    let check = 0;
    var line = fields.join(',');
    for (var i = 1; i < line.length; i++) {
        check = check ^ line.charCodeAt(i);
    };
    check = check.toString(16);
    return line+'*'+check+"\r\n";
}

function updatePosition(t) {
    const lat1 = latitude*Math.PI/180;
    const lon1  = longitude*Math.PI/180;
    const brng = cogt*Math.PI/180;
    const d = sog*0.514444*t; // in m;
    const R =  6378000;
    const lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) +
                      Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );
    const lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1),
                           Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));
    latitude = lat2*180/Math.PI;
    longitude = fix360(lon2*180/Math.PI);
}
function pad(v, p) {
    return (p+v.toFixed(0)).slice(-(p.length));
}

function nmeaLat(l) {
    // ddmm.mm
    const d = Math.trunc(l);
    const m = ("00"+((l-d)*60).toFixed(3)).slice(-6);
    return pad(d, "00")+m;
}
function nmeaLong(l) {
    // dddmm.mm
    const d = Math.trunc(l);
    const m = ("00"+((l-d)*60).toFixed(3)).slice(-6);
    return pad(d,"000")+m;
}



const serialport = new SerialPort({ path: devicePath, 
        baudRate: baudRate, 
        autoOpen: false });


serialport.open((err) => {
    if (err) {
        return console.log('Error opening port: ', err.message)
    }
});
serialport.on('open', () =>  {
    console.log("Port Opened, writing messages");
    setInterval(() => {
        awa = fix180(awa + 0.1*(Math.random()-0.50));
        aws = aws + 0.1*(Math.random()-0.50);
        hdm = fix360(hdm + 0.1*(Math.random()-0.50));
        stw = stw + 0.01*(Math.random()-0.50);

        cogt = cogt + 0.1*(Math.random()-0.50); 
        sog = stw + 0.5*(Math.random()-0.50); 

        updatePosition(1);

        const d = new Date();


        const dateDDMMYY = pad(d.getDate(), "00")+pad(d.getMonth()+1, "00")+pad(d.getYear()-100,"00");
        const timeUTC = pad(d.getHours(), "00")+pad(d.getMinutes(), "00")+pad(d.getSeconds(), "00")+"."+pad(d.getMilliseconds()/10,"00");
        const nlat = nmeaLat(latitude);
        const nlong = nmeaLong(longitude);
        const nlatNS = (latitude>0)?'N':'S';
        const nlongEW = (longitude>0)?'E':'W';

        serialport.write(createSentence([ "$IIMWV" , awa.toFixed(2), 'R', aws.toFixed(2), 'N', 'A']));
        serialport.write(createSentence([ "$IIROL" , roll.toFixed(2)]));
        serialport.write(createSentence([ "$IIVHW" , '', 'T', hdm.toFixed(2), 'M', stw.toFixed(2), 'N', (1.852*stw).toFixed(2), 'K']));
        serialport.write(createSentence([ "$IIHDG" , hdm.toFixed(2), 0, 'E', Math.abs(variation.toFixed(2)), variation<0?'W':'E'  ]));
        serialport.write(createSentence([ "$IIVTG" , cogt.toFixed(2), 'T', '', 'M', sog.toFixed(2), 'N', (1.852*sog).toFixed(2), 'K', 'D' ]));
        serialport.write(createSentence([ "$GPRMC" , timeUTC, 'A', nlat, nlatNS, nlong, nlongEW, sog.toFixed(2), cogt.toFixed(2), dateDDMMYY, variation.toFixed(2), (variation>0)?'E':'W', 'D' ]));
        serialport.write(createSentence([ "$GPGLL" , nlat, nlatNS, nlong, nlongEW, timeUTC, 'A', 'D' ]));
        serialport.write(createSentence([ "$GPGGA" , timeUTC, nlat, nlatNS, nlong, nlongEW, 2, 11, 1.02, 5.2, '-','M',121,'0123']));

    }, 1000);

})


