"use strict";
const { SerialPort }  = require('serialport');
const { ReadlineParser }  = require('@serialport/parser-readline');
const { EventEmitter }  = require('node:events');


class NMEA0183Reader extends EventEmitter {

    constructor() {
        super();
        this.path = undefined;
        this.serialPort = undefined;
        this.baudRate = 0;
    }
    async listPorts() {
        const list = await SerialPort.list();
        console.log("Serial Port List", list);
        return list;
    }
    async open( path, baudRate) {
        if ( path !== this.path || baudRate !== this.baudRate || this.serialPort == undefined ) {
            await this.close();
            this.path = path;
            this.baudRate = baudRate;
            console.log("Opening ", path, baudRate);
            this.serialPort = new SerialPort({ path: path, baudRate: baudRate, autoOpen: false});
            this.serialPort.on('open', () => {
                console.log('Serial Port opened');
            });
            this.serialPort.on('close', () => {
                that.emit('close');
            })
            const parser = this.serialPort.pipe(new ReadlineParser({delimiter: '\r\n', includeDelimiter: true}));
            const that = this;
            parser.on('data', (line) => {
                if ( line.startsWith('$') || line.startsWith('!')) {
                    const key = line.substring(0,6);
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
            });
        } else {
            console.log("Serial Port Already open ", this.path, this,baudRate);
        }
    }

    async close() {
        const that = this;
        return new Promise((resolve, reject) => {
            if ( that.serialPort) {
                console.log("Closing Serial Port");
                that.serialPort.close((err) => {
                    if ( err ) {
                        reject(err);
                    } else {
                        resolve();
                    }
                    that.serialPort = undefined;
                    that.path = undefined;
                    that.baudRate = 0;
                });
            } else {
                resolve();
            }
        });    
    }

}

module.exports =  { NMEA0183Reader };