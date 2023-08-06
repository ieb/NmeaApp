"use strict;"
import { NMEA0183Handler } from './nmeahandler.js';
import { Calculations } from './calculations.js';
import { Store } from './store.js';


class WebAppBgPage {
    constructor() {
        this.nmeaHandler = new NMEA0183Handler();
        this.store = new Store();
        this.calculations = new Calculations();
        this.serialPort = new SerialPort(this.nmeaHandler);
        this.update = this.update.bind(this);
        setInterval(this.update, 500);
    }

    update() {
        this.store.update(this.nmeaHandler)
        this.calculations.update(this.store, this.nmeaHandler);
    }

    async getNetworkAddresses() {
        return undefined;
    }
    async getDevices() {
        return undefined;
    }
    async stopServer() {
        console.log("Stopped server ");
    }
    async closeConnection() {
        return await this.serialPort.close();
    }
    async startServer(address, port) {
        console.log("Server would have been started on ",address, port);
    }
    async openConnection(baud) {
        return await this.serialPort.open(baud);
    }
    getPacketsRecieved() {
        return this.serialPort.packetsRecieved;
    }
    getStore() {
        return this.store;
    }
}



class SerialPort  {

    constructor(nmeaHandler) {
        this.packetsRecieved = 0;
        this.nmeaHandler = nmeaHandler;
    }


    async open(baudRate) {
        this.packetsRecieved = 0;
        try {
            const port = await navigator.serial.requestPort();
            const serialOptions = {
                baudRate: baudRate
            };
            console.log("Opening with ", serialOptions);
            await port.open(serialOptions);

            const decoder = new TextDecoderStream();
            port.readable.pipeTo(decoder.writable);
            const nmeaDecoder = new TransformStream(new NMEASentenceTransform());
            decoder.readable.pipeTo(nmeaDecoder.writable);

            const reader = nmeaDecoder.readable.getReader();
            const that = this;
            setTimeout(async () => {
                that.readingState = 0;
                while(that.readingState == 0) {
                    const { done, value } = await reader.read();
                    if ( done ) {
                        console.log("Done", done);
                        return;
                    }
                    if ( value !== undefined ) {
                        that.packetsRecieved++;
                        that.nmeaHandler.parseSentence(value.trim());                                
                    }
                }
                console.log("Stopped");
                reader.releaseLock();
                await nmeaDecoder.readable.cancel();
                setTimeout( async () => {
                    console.log("Before close");
                    await that.port.close();
                    console.log("After close");
                    that.readingState = 2;
                }, 100);
            }, 100);
            return true;            
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async close() {
        this.readingState = 1;
        return new Promise(((resolve, reject) => {
            const interval = setInterval(() => {
                if ( that.readingState == 2) {
                    console.log("Close Detected");
                    cancelInterval(interval);
                    cancelTimeout(timeout);
                    resolve(true);
                }
            },110);
            const timeout = setTimeout(() => {
                console.log("Close Timedout");
                cancelInterval(interval);
                cancelTimeout(timeout);
                resolve( that.readingState == 2);
            }, 30000);
        }).bind(this));
    }


}

class NMEASentenceTransform  extends TransformStream {
    constructor(splitOn) {
        super();
        this.buffer = "";
    }
    transform(chunk, controller) {
      this.buffer += chunk;
      const parts = this.buffer.split("\n");
      parts.slice(0, -1).forEach(part => controller.enqueue(part));
      this.buffer = parts[parts.length - 1];
    }
    flush(controller) {
        if (this.buffer) controller.enqueue(this.buffer);
    }

}


export { WebAppBgPage };