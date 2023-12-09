const net = require('node:net');
const readline = require('node:readline');
const Parser = require('@signalk/nmea0183-signalk')
const parser = new Parser()


let linebuffer = "";
net.connect({

  port: 10110,
  host: "127.0.0.1",
  onread: {
    // Reuses a 4KiB Buffer for every read from the socket.
    buffer: Buffer.alloc(4 * 1024),
    callback: function(nread, buf) {
        linebuffer += buf.toString('utf8', 0, nread);
        if(linebuffer.indexOf('\n') !=-1 ) {
            const lines = linebuffer.split('\n');
            linebuffer = lines.pop();
            lines.forEach(function(line) {
                try {
                    line = line.trim();
                    const delta = parser.parse(line);
                    if ( delta !== null ) {
                        console.log(JSON.stringify(delta));
                    } else {
                        console.log("============Not recognised:",line);

                    }
                } catch (error) {
                    console.error("-------------Got bad packet:", line, error);        
                }
            });
        }
    }
  }

});


