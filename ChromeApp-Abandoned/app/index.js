


class BgPageInterface {
  constructor() {

      // have to use dynamic imports since V2 manifests dont support modules.
      (async () => {
        const { NMEA0183Handler } = await import("./ui/src/nmeahandler.js");
        const { Calculations } = await import("./ui/src/calculations.js");
        const { Store } = await import("./ui/src/store.js");


        this.nmeaHandler = new NMEA0183Handler();
        this.store = new Store();
        this.calculations = new Calculations();
        this.tcpConnections = [];
        this.update = this.update.bind(this);
        this.updateTcpClients = this.updateTcpClients.bind(this);
        setInterval(this.update, 500);
        setInterval(this.updateTcpClients, 500);
      })();
  }

  update() {
      this.store.update(this.nmeaHandler)
      this.calculations.update(this.store, this.nmeaHandler);
  }
  async getNetworkAddresses() {
      return undefined;
  }
  async startServer(address, port) {
    if (this.tcpServer) {
      this.tcpServer.disconnect();
    }
    this.tcpServer = new TcpServer(address, port);
    var that = this;
    await new Promise((resolve, reject) => {
      that.tcpServer.listen((tcpConnection, socketInfo) => {
        that.tcpConnections[tcpConnection.socketId] = tcpConnection;
        console.log("Connection Accpepted", tcpConnection, socketInfo, that.tcpConnections);
        tcpConnection.addDataReceivedListener(function(data) {
          var lines = data.split(/[\n\r]+/);
          for (var i=0; i<lines.length; i++) {
            var line=lines[i];
            if (line.length>0) {
              console.log(`[${socketInfo.peerAddress}:${socketInfo.peerPort}] ${line}`);
            }
          }
        });
      });
      resolve();
    });
  }

  updateTcpClients() {
    const that = this;;
    if ( Object.keys(that.tcpConnections).length > 0 ) {
      const sentences = that.nmeaHandler.getSentencesToSend();
      for (const sentence of sentences) {
        for(const sid in that.tcpConnections) {
          that.tcpConnections[sid].sendMessage(sentence.line+"\r\n", (sendInfo) => {
            if ( sendInfo == undefined  ) {
              // remote socket closed.
              if ( that.tcpConnections[sid] !== undefined ) {
                console.log("Remote Closed",sid);
                that.tcpConnections[sid] = undefined;
                delete that.tcpConnections[sid];                              
              }
            } else if ( sendInfo.resultCode < 0 ) {
              console.log("TCP send Failed",sendInfo);
            }
          });
        }
      }                    
    }
  }



  async stopServer() {
    if (this.tcpServer) {
      this.tcpServer.disconnect();
      this.tcpServer=null;
      this.tcpConnections = [];
    }
  }

  async openConnection(baud, devicePath) {
    if ( ! this.connection ) {
      var that = this;
      this.packetsRecieved = 0;
      this.connection = new SerialConnection();
      this.connection.on('readLine', function(line) {
        that.packetsRecieved++;
        that.nmeaHandler.parseSentence(line.trim());
      });
      this.connection.on("disconnect", () => {
        console.log("Disconnected");
        that.connection = undefined;
      });
      this.connection.connect(devicePath, baud);
      await new Promise((resolve, reject) => {
        that.connection.on('connect', function() {
          console.log('Connected to ', devicePath);
          resolve(true);
        });
      });
    } else {
      console.log("Connection already open for ", devicePath);
    }
  }

  async closeConnection() {
    if ( this.connection ) {
      console.log("Closing serial connection");
      this.connection.disconnect();
      this.connection = undefined;
    } else {
      console.log("Connection not open ");
    }
  }

  getPacketsRecieved() {
      return this.packetsRecieved;
  }
  getStore() {
      return this.store;
  }
}



const bgPageInterface = new BgPageInterface();

// cant use the class functions from the ui, they dont appear to work.

function getStore() {
  return bgPageInterface.getStore();
}

async function getNetworkAddresses() {
  return await new Promise((resolve) => {
    TcpServer.getNetworkAddresses((deviceList) => {
      resolve(deviceList);
    });
  });
}

async function getDevices() {
  return await new Promise((resolve) => {
    SerialConnection.getDevices((ports) => {
      resolve(ports);
    });
  });
}
async function startServer(address, port) {
  console.log("Start TCP server at",address, port);
  return await bgPageInterface.startServer(address, port);
}
async function stopServer() {
  return await bgPageInterface.stopServer();
}
async function openConnection(baud, devicePath) {
  console.log("Open Serial ",devicePath, baud);
  return await bgPageInterface.openConnection(baud, devicePath);
}
async function closeConnection() {
  return await bgPageInterface.closeConnection();
}
function getPacketsRecieved() {
  return bgPageInterface.getPacketsRecieved();
}
function getStore() {
  return bgPageInterface.getStore();
}

/**
 * Listens for the app launching then creates the window
 *
 * @see https://developer.chrome.com/apps/app_runtime
 * @see https://developer.chrome.com/apps/app_window
 */

var commandWindow;
console.log("Running code");
chrome.app.runtime.onLaunched.addListener(function() {
  console.log("On lanched called");
    if (commandWindow && !commandWindow.contentWindow.closed) {
      commandWindow.focus();
    } else {
      chrome.app.window.create('ui/dist/index.html',
          {id: "mainwin", innerBounds: {width: 500, height: 309, left: 0}},
          (w) => {
              commandWindow = w;
          });
    }
});




