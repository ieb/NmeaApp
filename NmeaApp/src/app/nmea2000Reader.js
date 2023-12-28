"use strict";
const { GSUsb , NMEA2000MessageDecoder } = require('candleLightJS');
const { EventEmitter }  = require('node:events');
const process = require('node:process');


class NMEA2000Reader extends EventEmitter {

    constructor() {
        super();
        this.gs_usb = new GSUsb();
        const emit = this.emit.bind(this);
        const shutdown = this.close.bind(this);
        const messageDecoder = new NMEA2000MessageDecoder();
        this.gs_usb.on("frame", (frame) => {
            const message = messageDecoder.decode(frame);
            if ( message !== undefined ) {
                //console.log(JSON.stringify(message));
                emit('nmea2000Message', message);
            }
        });
        process.on('exit', async () => {
            console.log("NMEA2000Reader Got exit");
            await shutdown();
            console.log("Finished exit");
            process.exit();
        });
        process.on('SIGTERM', async () => {
            console.log("NMEA2000Reader Got term");
            await shutdown();
            console.log("Finished term");
            process.exit();
        });

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
        this.gs_usb.startStreamingCANFrmes();
        this.open = true;
        return {
            ok: true
        };
    }

    async close() {
        if ( this.open ) {
            await this.gs_usb.stop();
            console.log("NMEA2000Reader done stop GSUsb streaming");
            this.open = false;
        }
    }

}


module.exports =  { NMEA2000Reader };