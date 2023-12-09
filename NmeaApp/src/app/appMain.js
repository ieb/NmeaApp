"use strict";

const { NMEA0183Handler }  = require( "./nmea0183Handler.js");
const { NMEA0183Reader }  = require('./nmea0183Reader.js');
const { NMEA2000Reader }  = require('./nmea2000Reader.js');
const { NMEA0183Bridge }  = require('./nmea0183Bridge.js');
const { Calculations }  = require("./calculations.js");
const { Store }  = require("./store.js");
const { TcpServer }  = require('./tcpServer.js');


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
        this.nmea0183Reader = new NMEA0183Reader();
        this.nmea2000Reader = new NMEA2000Reader();
        this.nmea0183Bridge = new NMEA0183Bridge();
        this.store = new Store();
        this.calculations = new Calculations();
        this.tcpServer = new TcpServer();
        this.packetsRecieved = 0;
        // must bind the API methods.
        this.getNetworkAddresses = this.getNetworkAddresses.bind(this);
        this.getDevices = this.getDevices.bind(this);
        this.stopServer = this.stopServer.bind(this);
        this.closeConnection = this.closeConnection.bind(this);
        this.startServer = this.startServer.bind(this);
        this.openConnection = this.openConnection.bind(this);
        this.getPacketsRecieved = this.getPacketsRecieved.bind(this);

        // start the update intervals
        this.update = this.update.bind(this);
        this.updateTcpClients = this.updateTcpClients.bind(this);
        // connect the reader to the parser
        this.nmea0183Reader.on('sentence', (line) => {
            this.nmea0183Handler.parseSentence(line);
            this.packetsRecieved++;
        });
        this.nmea0183Handler.on("nmea0183Sentence", (sentence) => {
            this.store.updateFromNMEA0183Stream(sentence);
        });
        this.nmea2000Reader.on("nmea2000Message", (message) => {
            this.store.updateFromNMEA2000Stream(message);
            this.nmea0183Bridge.update(message, this.nmea0183Handler);
        });

    }
    start() {
        if (!this.updateInterval) {
            this.updateInterval = setInterval(this.update, 500);
        }
        if (!this.clientInterval) {
            this.clientInterval = setInterval(this.updateTcpClients, 500);
        }
        console.log("Backend running");
    }
    async shutdown() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = undefined;
        }
        if (this.clientInterval) {
            clearInterval(this.clientInterval);
            this.clientInterval = undefined;
        }
        await this.nmea0183Reader.close();
        await this.tcpServer.close();
    }


    update() {
      this.store.mergeUpdate();
      this.calculations.update(this.store, this.nmea0183Handler);
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

    async getDevices() {
        return await this.nmea0183Reader.listPorts();
    }


    async getNetworkAddresses() {
        return await this.tcpServer.networkInterfces();
    }
    async startServer(address, port) {
        console.log("Got startServer message",address, port);
        return await this.tcpServer.open(address, port);
    }

    async stopServer() {
      return await this.tcpServer.close();
    }

    async openNMEA2000() {
        return await this.nmea2000Reader.begin();
    }

    async closeNMEA2000() {
        return await this.nmea2000Reader.close();
    }

    async openConnection(path, baud) {
        console.log("Got openConnection message",path, baud);
        return await this.nmea0183Reader.open(path, baud);
    }

    async closeConnection() {
        return await this.nmea0183Reader.close();
    }

    getPacketsRecieved() {
          return this.packetsRecieved;
    }
}

module.exports =  { AppMain };
