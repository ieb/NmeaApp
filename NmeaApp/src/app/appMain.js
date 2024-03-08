"use strict";
const fs = require('node:fs/promises');
const { NMEA0183Handler }  = require( "./nmea0183Handler.js");
//const { NMEA0183Reader }  = require('./nmea0183Reader.js');
const { NMEA2000Reader }  = require('./nmea2000Reader.js');
const { NMEA0183Bridge }  = require('./nmea0183Bridge.js');
const { Calculations }  = require("./calculations.js");
const { Store }  = require("./store.js");
const { TcpServer }  = require('./tcpServer.js');
const { Playback } = require('./playback.js');

/*


Or drop the NMEA0183 handling
nema0183reader emits "sentence" events
nmea0183handler emits nmea0183Sentence events for sentences it parses, sent to store
nmea2000reader emits nmea2000Message events, sent to store and nmea0183Transltor.
nmea0183Bridge updates the nmea0182handler with sentences translated from n2k messages.

on interval the store is updated with a collected state update.
and calculations are performed.
calculations updates nmea0183handler with sentences it 

the nmea0183Bridge holds sentences, once that are updated are emitted to the tcpServer periodically.
*/


class AppMain {
    constructor() {
        this.nmea0183Handler = new NMEA0183Handler();
//        this.nmea0183Reader = new NMEA0183Reader();
        this.nmea2000Reader = new NMEA2000Reader();
        this.nmea0183Bridge = new NMEA0183Bridge();
        this.store = new Store();
        this.calculations = new Calculations();
        this.tcpServer = new TcpServer();
        this.packetsRecieved = 0;
        // must bind the API methods.
        this.getPacketsRecieved = this.getPacketsRecieved.bind(this);

        // start the update intervals
        this.update = this.update.bind(this);
        this.updateTcpClients = this.updateTcpClients.bind(this);
        // connect the reader to the parser
/*
        this.nmea0183Reader.on('sentence', (line) => {
            this.nmea0183Handler.parseSentence(line);
            this.packetsRecieved++;
        });
*/
        this.nmea0183Handler.on("nmea0183Sentence", (sentence) => {
            this.store.updateFromNMEA0183Stream(sentence);
        });
        this.nmea2000Reader.on("nmea2000Message", (message) => {
            this.packetsRecieved++;
            this.store.updateFromNMEA2000Stream(message);
            this.nmea0183Bridge.update(message, this.nmea0183Handler);
        });
        this.calculations.on("update", (calculatedState) => {
            this.nmea0183Bridge.updateCalculatedSentences(calculatedState, this.nmea0183Handler);
        });

    }
    async startPlayback(filePath) {
        console.log("Start playback", filePath);
        this.playbackRunning = true;
        const that = this;
        setTimeout( async () => {
            await Playback.playbackDemoFile(filePath,(message) => {
                that.packetsRecieved++;
                console.log("Got messge ", message);
                that.store.updateFromNMEA2000Stream(message);
                that.nmea0183Bridge.update(message, this.nmea0183Handler);
                return that.playbackRunning;
            });
        }, 10);
        return true;
    }

    async stopPlayback() {
        console.log("Stop playback");
        this.playbackRunning = false;
        return true;
    }
    async start() {
        if (!this.updateInterval) {
            this.updateInterval = setInterval(this.update, 500);
        }
        if (!this.clientInterval) {
            this.clientInterval = setInterval(this.updateTcpClients, 500);
        }

        await this.nmea2000Reader.keepOpen();
        await this.startServer();
        console.log("Backend running ");
    }
    shutdown(cb) {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = undefined;
        }
        if (this.clientInterval) {
            clearInterval(this.clientInterval);
            this.clientInterval = undefined;
        }
        this.tcpServer.close().then(() => {
            this.nmea2000Reader.stopKeepOpen().then(() => {
                console.log("Shutdown: Close Complete")
                cb();
            });
        });
    }


    update() {
      this.store.mergeUpdate(this.calculations);
    }


    updateTcpClients() {
        const that = this;
        if ( this.tcpServer.hasConnections() ) {
          const sentences = that.nmea0183Handler.getSentencesToSend();
          if ( sentences && sentences.length > 0) {
              for (const sentence of sentences) {
                this.tcpServer.send(sentence.line+"\n\r");
              }                    
          }
        }
    }


    async startServer() {
        const networkAddresses = await this.tcpServer.networkInterfces();
        const ipV4Addresses = [];
        const allAddresses = [];
        for (var ifname in networkAddresses ) {
            for (var ipIf of networkAddresses[ifname]) {
                if ( ipIf.family === "IPv4" && ipIf.address !== '127.0.0.1' ) {
                    ipV4Addresses.push(ipIf.address);
                }
                allAddresses.push(ipIf.address);
            }
        }
        if ( ipV4Addresses.length == 0 ) {
            ipV4Addresses.push("127.0.0.1");
        }
        console.log("All Addresses ", allAddresses);
        console.log("Available Addresses ", ipV4Addresses);
        await this.tcpServer.open(ipV4Addresses[0], 10110);
        console.log(`Opened TCP Server at ${this.tcpServer.address}:${this.tcpServer.port}`);
    }


    getPacketsRecieved() {
          return this.packetsRecieved;
    }

    getConnectedClients() {
        if ( this.tcpServer === undefined || this.tcpServer.connections === undefined ) {
            return 0;
        }
        return Object.keys(this.tcpServer.connections).length;
    }

    getNmea0183Address() {
        return `${this.tcpServer.address}:${this.tcpServer.port}`;
    }
}

module.exports =  { AppMain };
