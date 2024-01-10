"use strict";
const net  = require('node:net');
const { EventEmitter }  = require('node:events');
const { networkInterfaces } = require('node:os');


/**
 * Opens a TCP server on port 10110
 * Exposes a method to write messages to the server
 */

class TcpServer extends EventEmitter {
    constructor() {
        super();
        this.connections = {};
        this.port = 0;
    }

    async networkInterfces() {
        return new Promise((resolve, reject) => {
            try {
                const networkList = networkInterfaces();
                resolve(networkList);
            } catch(e) {
                console.log(e);
                reject(false, e);
            }
        });
    }

    hasConnections() {
        return (Object.keys(this.connections).length > 0);
    }

    async open(address, port) {
        if (  this.server === undefined || this.port !== port || this.address !== address  ) {
            await this.close();
            this.port = port || 10110;
            this.address = address || "0.0.0.0";
            console.log("Opening TCP Server on ",this.address ,this.port);
            const that = this;
            this.server = net.createServer((conn) => {
                const remoteAddress = `${conn.remoteAddress}:${conn.remotePort}`;
                console.log(`connection ${remoteAddress} opened`);
                that.connections[remoteAddress] = conn;
                conn.setEncoding('utf8');
                conn.on('data', (d) => {
                    console.log(`connection ${remoteAddress} data  ${d}`);
                    that.emit('data', remoteAddress, d);
                });
                conn.on('close', (hadError) => {
                    console.log(`connection ${remoteAddress} closed Error:${hadError}`);
                    delete that.connections[remoteAddress];
                    that.emit('close', remoteAddress);
                });
                conn.on('timeout', () => {
                    console.log(`connection ${remoteAddress} timeout `);
                    conn.close();
                });
                conn.on('error', (error) => {
                    console.log(`connection ${remoteAddress} error`, error);
                });
            });
            this.server.on('error', (e) => {
                console.log('tcpserver error',e);
            });
            this.server.on('drop', (c) => {
                console.log('tcpserver dropped',c);
            });
            this.server.on('close', () => {
                console.log(`tcpserver closed`);
                that.emit('unlisten');
            });
            this.server.on('listening', () => {
            });
            return new Promise((resolve, reject ) => {
                that.server.listen(that.port, that.address, (err) => {
                    if ( err ) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });  

            });
        } else {
            console.log("Port already open ",this.port);
            return new Promise((resolve ) => {
                resolve();
            });
        }

    }


    send(message) {
        if ( this.server !== undefined) {
            //should this be async, probably.
            for (const remoteAddress in this.connections) {
                this.connections[remoteAddress].write(message);
            }            
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


module.exports = { TcpServer };
