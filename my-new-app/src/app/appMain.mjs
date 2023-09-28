"use strict";

import { NMEA0183Handler } from "./nmeahandler.mjs";
import { Calculations } from "./calculations.mjs";
import { Store } from "./store.mjs";
import { NMEA0183Reader } from './nmea0183Reader.mjs';
import { TcpServer } from './tcpServer.mjs';

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
        setInterval(this.update, 500);
        setInterval(this.updateTcpClients, 500);


        // connect the reader to the parser
        this.nmea0183Reader.on('message', (line) => {
            this.nmeaHandler.parseSentence(line);
        });



    }

    getMainAPI () {
        return this;
    }
    getStoreAPI() {
        return this.store;
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
        return undefined;
    }


    async getNetworkAddresses() {
        return undefined;
    }
    async startServer(port) {
        this.tcpServer.open(port);
    }

      async stopServer() {
        this.tcpServer.close();
      }

      async openConnection(baud, devicePath) {
        await this.nmea0183Reader.open(devicePath, baud);
      }

      async closeConnection() {
      }

      getPacketsRecieved() {
          return this.packetsRecieved;
      }

}

export { AppMain };
