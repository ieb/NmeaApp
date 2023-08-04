const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { Calculations } = require('calcs.js');
const { NMEA0183Handler } = require('parser.js');
const net = require('net');


var server = net.createServer();    
server.listen(10110, () => {
    console.log("Listening on 10110");
});    

const connections = {};

server.on('connection', (conn) => {
  let remoteAddress = conn.remoteAddress + ':' + conn.remotePort;  
  connections[remoteAddress] = conn;
  console.log('new client connection from %s', remoteAddress);
  conn.setEncoding('utf8');
  conn.on('data', (d) =>  {
    console.log('connection data from %s: %j', remoteAddress, d);  
  });  
  conn.once('close', () => {
    console.log('connection from %s closed', remoteAddress);  
    delete connections[remoteAddress];
  });  
  conn.on('error', (err) => {
    console.log('Connection %s error: %s', remoteAddress, err.message);  
  });
});

console.log(SerialPort);
const nmea0183Handler = new NMEA0183Handler();
const serialport = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 4800 });
const parser = stream.pipe(new ReadlineParser({ delimiter: '\r\n' }));
const calculations = new Calculations();

parser.on('data', (line) => {
    nmea0183Handler.parseSentence(line);
    calculations.update(nmea0183Handler);
});

let lastOutput = Date.now();
setInterval(() => {
    const sentences = nmea0183Handler.updatesSince(lastOutput);
    lastOutput = sentences.slice(-1).lastUpdate;
    for (var s of sentences) {
        if ( s.line !== undefined ) {
            const op = s.line+"\r\n";
            for (const r in connections) {
                connections[r].write(op);
            }
        }
    }
},2000);





serialport.on('close',() => {
    for (const remoteAddress in connections) {
        connections[remoteAddress].close();
    }
});


