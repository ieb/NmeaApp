"use strict";
const { SerialPort }  = require('serialport');
const { ReadlineParser }  = require('@serialport/parser-readline');
const { EventEmitter }  = require('node:events');


class NMEA0183Reader extends EventEmitter {

    constructor() {
        super();
    }
    async open( port, baudRate) {
        port = port || '/dev/ttyUSB0';
        baudRate = baudRate || 115200;
        this.serialPort = new SerialPort({ path: port, baudRate: baudRate, autoOpen: false});
        this.serialPort.on('open', () => {
            console.log('Serial Port opened');
        });
        this.serialPort.on('close', () => {
            that.emit('close');
        })
        const parser = serialPort.pipe(new ReadlineParser({delimiter: '\r\n', includeDelimiter: true}));
        const that = this;
        parser.on('data', (line) => {
            if ( line.startsWith('$') || line.startsWith('!')) {
                const key = line.substring(0,6);
                messages[key] = {
                    t: Date.now(),
                    msg: line.trim()
                };
                that.emit('message', line);
            }
        });
        return new Promise((resolve, reject) => {
            that.serialPort.open((err) => {
                if ( err ) {
                    reject(err);
                } else {
                    resolve();
                }
            });

        })
    }

}

module.exports =  { NMEA0183Reader };