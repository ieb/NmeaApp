"use strict";

const { NMEA0183Handler }  = require( "./nmeahandler.js");
const { Calculations }  = require("./calculations.js");
const { Store }  = require("./store.js");
const { NMEA0183Reader }  = require('./nmea0183Reader.js');
const { TcpServer }  = require('./tcpServer.js');

class AppMain {
    constructor() {
        this.nmeaHandler = new NMEA0183Handler();
        this.store = new Store();
        this.calculations = new Calculations();
        this.tcpServer = new TcpServer();
        this.nmea0183Reader = new NMEA0183Reader();
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
        this.nmea0183Reader.on('message', (line) => {
            this.nmeaHandler.parseSentence(line);
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
      this.store.update(this.nmeaHandler)
      this.calculations.update(this.store, this.nmeaHandler);
    }


    updateTcpClients() {
        const that = this;
        if ( this.tcpServer.hasConnections() ) {
          const sentences = that.nmeaHandler.getSentencesToSend();
          for (const sentence of sentences) {
            this.tcpServer.send(sentence.line+"\n\r");
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
