
var tcpServer;
var commandWindow;
var serialConnections = {};
var tcpConnections = {};
const nmea0183Handler = new NMEA0183Handler()
const calculations = new Calculations();


/**
 * Listens for the app launching then creates the window
 *
 * @see https://developer.chrome.com/apps/app_runtime
 * @see https://developer.chrome.com/apps/app_window
 */
console.log("Running code");
chrome.app.runtime.onLaunched.addListener(function() {
  console.log("On lanched called");
    if (commandWindow && !commandWindow.contentWindow.closed) {
        commandWindow.focus();
    } else {
        chrome.app.window.create('ui/index.html',
            {id: "mainwin", innerBounds: {width: 500, height: 309, left: 0}},
            (w) => {
                commandWindow = w;

                // start UI update thread.
                setInterval(() => {
                  calculations.update(nmea0183Handler);
                }, 500);

                // start TCP client send thread.
                setInterval(() => {
                  console.log("TCP send ",tcpConnections);
                  if ( Object.keys(tcpConnections).length > 0 ) {
                    const sentences = nmea0183Handler.getSentencesToSend();
                    for (const sentence of sentences) {
                      for(const sid in tcpConnections) {
                        tcpConnections[sid].sendMessage(sentence.line+"\r\n", (sendInfo) => {
                          if ( sendInfo == undefined  ) {
                            // remote socket closed.
                            if ( tcpConnections[sid] !== undefined ) {
                              console.log("Remote Closed",sid);
                              tcpConnections[sid] = undefined;
                              delete tcpConnections[sid];                              
                            }
                          } else if ( sendInfo.resultCode < 0 ) {
                            console.log("TCP send Failed",sendInfo);
                          }
                        });
                      }
                    }                    
                  }
                }, 500);


            });
    }
});


// event logger
var log = (() => {
  var logLines = [];
  var logListener = null;

  var output=(str) => {
    if (str.length>0 && str.charAt(str.length-1)!='\n') {
      str+='\n'
    }
    logLines.push(str);
    if (logListener) {
      logListener(str);
    }
  };

  var addListener=(listener) => {
    logListener=listener;
    // let's call the new listener with all the old log lines
    for (var i=0; i<logLines.length; i++) {
      logListener(logLines[i]);
    }
  };

  return {output: output, addListener: addListener};
})();





// Control of the TCP server.
// These run inside the background page which is called 
// triggered by events bound to the UI in server.js
function startServer(addr, port) {
  if (tcpServer) {
    tcpServer.disconnect();
  }
  tcpServer = new TcpServer(addr, port);
  tcpServer.listen((tcpConnection, socketInfo) => {
    var info="["+socketInfo.peerAddress+":"+socketInfo.peerPort+"] Connection accepted!";
    log.output(info);
    tcpConnections[tcpConnection.socketId] = tcpConnection;
    console.log("Connection Accpepted", tcpConnection, socketInfo, tcpConnections);

    tcpConnection.addDataReceivedListener(function(data) {
      var lines = data.split(/[\n\r]+/);
      for (var i=0; i<lines.length; i++) {
        var line=lines[i];
        if (line.length>0) {
          var info="["+socketInfo.peerAddress+":"+socketInfo.peerPort+"] "+line;
          log.output(info);

/*          var cmd=line.split(/\s+/);
          try {
            tcpConnection.sendMessage(Commands.run(cmd[0], cmd.slice(1)));
          } catch (ex) {
            tcpConnection.sendMessage(ex);
          } */
        }
      }
    });
    tcpConnection.addClose
  });
}


function stopServer() {
  if (tcpServer) {
    tcpServer.disconnect();
    tcpServer=null;
  }
}

function getServerState() {
  if (tcpServer) {
    return {isConnected: tcpServer.isConnected(),
      addr: tcpServer.addr,
      port: tcpServer.port};
  } else {
    return {isConnected: false};
  }
}



function openConnection(devicePath, cb) {

  if ( serialConnections[devicePath] === undefined) {
    console.log("Created new Serial for ",devicePath);
    var connection = new SerialConnection();
    console.log("Serial Object exists ",connection);
    console.log("On connect listener ",connection.onConnect);
    connection.on('connect', function() {
      console.log('Connected to ', devicePath);
      if ( cb ) {
        cb("connected");
      }
    });

    connection.on('readLine', function(line) {
      nmea0183Handler.parseSentence(line.trim());
      nmea0183Handler.dump();
      if ( cb ) {
        cb("data", line);
      }
    });
    connection.on("disconnect", () => {
      if (cb) {
        cb("disconnect");
      }
    });

    console.log("Connecting to ", devicePath);
    connection.connect(devicePath);
    serialConnections[devicePath] = connection;
  } else {
    console.log("Connection already open for ", devicePath);

  }
}

function closeConnection(devicePath) {
  if ( serialConnections[devicePath] !== undefined ) {
    console.log("Closing connection",devicePath);
    serialConnections[devicePath].disconnect();
    delete serialConnections[devicePath];
  } else {
    console.log("Connection not found for ", devicePath);
  }
}

