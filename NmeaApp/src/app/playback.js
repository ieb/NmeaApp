
const fs = require('node:fs');
const readline = require('node:readline');

/*
ESSAGE {"frameLength":24,"data":{},
"echo_id":4294967295,"can_id":2314276278,"can_dlc":8,
"channel":0,"flags":0,"reserved":0,
"timestamp_us":4264232911,
"errors":{},"frameType":
"extended","messageHeader":{"sourceAddress":182,"priority":2,"destination":255,"pgn":127245}} {"pgn":127245,"message":"N2K Rudder","instance":252,"rudderDirectionOrder":{"id":0,"name":"NoDirectionOrder"},"angleOrder":-1000000000,"rudderPosition":0.004200000000000001}
*/

class Playback {


	static _parseMessage(line) {
	    const parts = line.split("} {");
	    if (parts.length > 1) {
	        const frame = JSON.parse(parts[0].substring("MESSAGE ".length)+"}");
	        const message = JSON.parse("{"+parts[1]);
	        message.timestamp_us = frame.timestamp_us;
	        return message;
	    }
	    return undefined;
	}
	static _uint32Subtract(tlast, tfirst) {
	    if ( tfirst > tlast) {
	    	return 4294967296-tfirst+tlast;
	    } else {
	    	return tlast - tfirst;
	    }	
	}

 	static async playbackDemoFile(filename, cb) {
        let tlast = undefined;
        let tfirst = undefined;
        let lastEmit_ms = undefined;
        let firstEmit_ms = undefined;
		const rl = readline.createInterface(fs.createReadStream(filename, { encoding: 'utf8' }));
        for await (const input of rl) {
        	if ( input.startsWith("MESSAGE ") ) {
	        	const message = Playback._parseMessage(input);
	        	if ( message !== undefined ) {
		            if ( tfirst == undefined ) {
		               tfirst = message.timestamp_us;
		               lastEmit_ms = Date.now();
		               firstEmit_ms = lastEmit_ms;
		            } else {
		               tlast = message.timestamp_us;
		               const emitAt = Playback._uint32Subtract(tlast, tfirst)/1000+firstEmit_ms;
		               const delay_ms = emitAt - Date.now();
		               if ( delay_ms > 0 ) {
		                   await new Promise((resolve) => {
		                           setTimeout(resolve, delay_ms);
		                   });
		               }
		               lastEmit_ms = Date.now();
		            }
		            if ( cb !== undefined ) {
		            	if ( !cb(message) ) {
		            		console.log("Stop requested");
		            		break;
		            	}
		            }
		        }        		
        	}
	    }
		const playBackDrift_ms = (lastEmit_ms - firstEmit_ms) - Playback._uint32Subtract(tlast, tfirst)/1000;
		console.log(`playback drift ${playBackDrift_ms} ms`);    	

    }


}

// allo testing of the class, python style.
if ( process.argv[1] === __filename ) {
	if ( process.argv.length < 3 ) {
		console.log("Usage to test: node playback.js <logfile>");
		console.log("Otherwise load as a module");
	} else {
		new Promise(async (resolve) => {
			await Playback.playbackDemoFile(process.argv[2],(message) => {
				//console.log(message);
				return true;
			});
			resolve();
		}).then(() => {
			console.log("Done");
		});

	}
} else {
	module.exports =  { Playback };
}



