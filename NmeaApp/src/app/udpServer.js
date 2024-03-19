"use strict";
const dgram = require('node:dgram');


/**
 * Opens a UCP server on port 10110
 * Exposes a method to write messages to the server
 */

class UdpServer  {
    constructor() {
        this.port = 0;
        this.address = undefined;
        this.server = undefined;
    }


    hasConnections() {
        return (Object.keys(this.connections).length > 0);
    }

    async open(address, port) {
        if ( address == undefined || port == undefined ) {
            console.log("Cant open to address:port", address, port);
        } else if (  this.server === undefined || this.port !== port || this.address !== address  ) {
            await this.close();
            this.server = dgram.createSocket('udp4');
            this.port = port;
            this.address = address;
            const that = this;
            this.server.on('error', (err) =>  {
                console.log(`server error:\n${err.stack}`);
                that.server.close();
                that.server = undefined;
                setTimeout( async () => {
                    await that.open(this.address, this.port);
                }, 10);
            });
            this.server.on('listening', () => {
                console.log("UDP Bound");
                this.server.setBroadcast(true);
            });
            this.server.on('message', (message, remote) => {
                console.log('CLIENT RECEIVED: ', remote.address + ':' + remote.port +' - ' + message);
            });
            this.server.bind(port);
            console.log("Server Opened");
        } else {
            console.log("Not reopening server");
        }
    }

    send(message) {
        if ( this.server !== undefined) {
            this.server.send(message, this.port, this.address, (err) => {
                console.log("Sent UDP ",this.port, this.address, message, err);
            });
        } else {
            console.log("Not open");
        }
    }


    async close() {
        return new Promise((resolve) => {
                if ( this.server != undefined ) {
                    console.log("Closing TCP Server");
                    this.server.close();
                    this.server = undefined;
                    this.port = 0;            
                }
                resolve();
            });
    }

}


module.exports = { UdpServer };
