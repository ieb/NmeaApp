"use strict";
const { GSUsb , NMEA2000MessageDecoder } = require('candleLightJS');
const { EventEmitter }  = require('node:events');
const process = require('node:process');


class NMEA2000Reader extends EventEmitter {

    constructor() {
        super();
        this.gs_usb = new GSUsb();
        const processFrame = this.processFrame.bind(this);
        const keepOpen = this.keepOpen.bind(this);
        const stopKeepOpen = this.stopKeepOpen.bind(this);

        const messageDecoder = new NMEA2000MessageDecoder();
        this.doKeepOpen = true;
        this.gs_usb.on("frame", (frame) => {
            await processFrame(frame);
        });
        this.gs_usb.on("error", async (msg) => {
            if ( this.open ) {
                console.log("Got USB Error, will close device", msg);
                await this.close();                
            }
        });
    }

    async processFrame(frame) {
        const message = messageDecoder.decode(frame);
        if ( message !== undefined ) {
            //console.log(JSON.stringify(message));
            this.emit('nmea2000Message', message);
        }        
    }

    async stopKeepOpen(cb) {
            console.log("Stop keeping open NMEA2000 stream");
            this.doKeepOpen = false;
            if ( this.keepAliveTimeout ) {
                clearTimeout(this.keepAliveTimeout);
            }
            await this.close();
    }

    async keepOpen() {
        if ( (!this.doKeepOpen) ) {
            return;
        }

        if ( !this.open ) {
            console.log("Try reopen NMEA2000");
            await this.begin();
        } else if (! await this.gs_usb.identify(0) ) {
            // not responding.
            console.log("NMEA2000 not responding.");
            await this.close();
        }
        const keepOpen = this.keepOpen.bind(this);
        this.keepAliveTimeout = setTimeout(async () => {
            await keepOpen();
        }, 5000);
    }
    


    async begin() {
        const status = await this.gs_usb.start(250000, GSUsb.GS_DEVICE_FLAGS.hwTimeStamp);
        if ( !status.ok ) {
            console.log("Failed to start GC USB ", status);            
            return status;
        }
        console.log("Started GS USB");
        const filtersIn = {
            sourceFilter: [],
            destinationFilter: [],
            pgnFilter: [
                126992, // System time
                127250, // Heading
                127257, // attitude
                127258, // variation
                128259, // speed
                128267, // depth
                128275, // log
                129029, // GNSS
                129026, // sog cog rapid
                129283, // XTE
                130306, // wind
                127506, // DC Status
                127508, // DC Bat status
                130312, // temp
                127505, // fluid level
                127489, // Engine Dynamic params
                127488, // Engine Rapiod
                130314, // pressure
                127245 // rudder
            ]
        };


        await this.gs_usb.setupDeviceFilters(filtersIn);

        const filters = await this.gs_usb.getDeviceFilters();
        console.log("Filters are ", filters);
        this.gs_usb.startStreamingCANFrames();
        this.open = true;
        return {
            ok: true
        };
    }

    async close() {
        try {
            this.open = false;
            await this.gs_usb.stop();
            console.log("NMEA2000Reader done stop GSUsb streaming");
        } catch (e) {
            console.log("Close failed with  ",e);
        }

    }

}


module.exports =  { NMEA2000Reader };