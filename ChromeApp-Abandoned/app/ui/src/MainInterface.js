


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