"use strict";
const { GSUsb , NMEA2000MessageDecoder, CanPlayer, CanRecorder } = require('candleLightJS');
const { EventEmitter }  = require('node:events');


class NMEA2000Reader extends EventEmitter {

    constructor() {
        super();
        this.gs_usb = new GSUsb();
        this.canRecoder = undefined;
        const processFrame = this.processFrame.bind(this);
        this.keepOpen = this.keepOpen.bind(this);
        this.stopKeepOpen = this.stopKeepOpen.bind(this);

        this.messageDecoder = new NMEA2000MessageDecoder();
        this.doKeepOpen = true;
        this.canPlayer = undefined;
        this.gs_usb.on("frame", async (frame) => {
            if ( this.canRecoder ) {
                this.canRecoder.write(frame); 
            }   
            if (this.canPlayer == undefined ) {
                await processFrame(frame);
            }
        });
        this.gs_usb.on("error", async (msg) => {
            if ( this.open ) {
                console.log("Got USB Error, will close device", msg);
                //await this.close();                
            }
        });
    }

    async processFrame(frame) {
        const message = this.messageDecoder.decode(frame);
        this.emit('nmea2000Message', message, frame);
    }

    async stopKeepOpen() {
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
                130316, // ext temp
                127505, // fluid level
                127489, // Engine Dynamic params
                127488, // Engine Rapiod
                130314, // pressure
                127245, // rudder
                130310,  // outside environmental parameters
                130311   // enviromental parameters 
            ]
        };


        await this.gs_usb.setupDeviceFilters(filtersIn);

        const filters = await this.gs_usb.getDeviceFilters();
        console.log("Filters are ", filters);

        setTimeout(async () => {
            await this.gs_usb.startPolling();
        }, 100);
        this.open = true;
        return {
            ok: true
        };
    }

    async close() {
        try {
            if ( this.open ) {
                this.open = false;
                await this.gs_usb.stopPolling();
                await this.gs_usb.stop();
                console.log("NMEA2000Reader done stop GSUsb streaming");                
            }
        } catch (e) {
            console.log("Close failed with  ",e);
        }

    }


    playbackStart(filePath) {
        console.log("Start playback", filePath);
        this.playbackStop(); // just in case.
        this.canPlayer = new CanPlayer();
        this.canPlayer.on('frame', async (frame) => {
            await this.processFrame(frame);
        });
        this.canPlayer.on('end', () => {
            this.emit('playbackEnd');
            this.canPlayer = undefined;            
        });
        this.canPlayer.start(filePath);        
    }

    playbackStop() {
        if ( this.canPlayer ) {
            this.canPlayer.stop();
            this.canPlayer = undefined;
        }
    }

    captureStart(filePath) {
        this.captureStop(); // just in case.
        this.canRecoder = new CanRecorder();
        this.canRecoder.open(filePath);
    }
    captureStop() {
        if ( this.canRecoder ) {
            this.canRecoder.close();
            this.canRecoder = undefined;

        }
    }
}


module.exports =  { NMEA2000Reader };