"use strict";
import net from 'node:net';
import { EventEmitter } from 'node:events';


/**
 * Opens a TCP server on port 10110
 * Exposes a method to write messages to the server
 */

class TcpServer extends EventEmitter {
    constructor() {
        super();
        this.connections = {};
    }

    hasConnections() {
        return (Object.keys(this.connections) > 0);
    }

    async open(port) {
        port = port || 10110;
        const that = this;
        this.server = net.createServer();
        this.server.on('connection', (conn) => {
            const remoteAddress = `${conn.remoteAddress}:${conn.remotePort}`;
            that.connections[remoteAddress] = conn;
            conn.setEncoding('utf8');
            conn.on('data', (d) => {
                console.log(`connection ${remoteAddress} data  ${d}`);
                that.emit('data', remoteAddress, d);
            });
            conn.once('close', () => {
                console.log(`connection ${remoteAddress} closed`);
                delete that.connections[remoteAddress];
                that.emit('close', remoteAddress, err);
            });
            conn.on('error', (err) => {
                console.log(`connection  ${remoteAddress} error ${err.message}`);
                that.emit('err', remoteAddress, err);
            });
        });
        this.server.on('close', (conn) => {
            that.emit('unlisten');
        });
        return new Promise((resolve, reject ) => {
            that.server.listen(port, (err) => {
                if ( err ) {
                    reject(err);
                } else {
                    console.log("Listening on 10110");
                    resolve();
                }
            });  

        });

    }

    send(message) {
        //should this be async, probably.
        for (const remoteAddress in this.connections) {
            this.connections[remoteAddress].write(message);
        }
    }

    close() {
        for (const remoteAddress in this.connections) {
            this.connections[remoteAddress].close();
        }
        this.server.close();
    }

}


export { TcpServer };
