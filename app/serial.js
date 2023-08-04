
console.log("Creating Serial connection classes");

(function(exports) {

 const serial = chrome.serial;

/* Interprets an ArrayBuffer as UTF-8 encoded string data. */
var ab2str = function(buf) {
  var bufView = new Uint8Array(buf);
  var encodedString = String.fromCharCode.apply(null, bufView);
  return decodeURIComponent(escape(encodedString));
};

/* Converts a string to UTF-8 encoding in a Uint8Array; returns the array buffer. */
var str2ab = function(str) {
  var encodedString = unescape(encodeURIComponent(str));
  var bytes = new Uint8Array(encodedString.length);
  for (var i = 0; i < encodedString.length; ++i) {
    bytes[i] = encodedString.charCodeAt(i);
  }
  return bytes.buffer;
};



var SerialConnection = function() {
  this.connectionId = -1;
  this.lineBuffer = "";
  this.boundOnReceive = this.onReceive.bind(this);
  this.boundOnReceiveError = this.onReceiveError.bind(this);
  this.listeners = {};
};


SerialConnection.getDevices = function(callback) {
  serial.getDevices(callback);
};

SerialConnection.prototype.connect = function(path) {
  console.log("Connecting");
  serial.connect(path, ((connectionInfo) => {
      if (!connectionInfo) {
        if (  this.listeners['error'] ) {
            this.listeners['error']("Connection failed");
        }
        console.log("Connection failed.");
        return;
      }
      console.log("Connected ", connectionInfo);
      chrome.serial.onReceive.addListener(this.boundOnReceive);
      chrome.serial.onReceiveError.addListener(this.boundOnReceiveError);
      this.connectionId = connectionInfo.connectionId;
      if (  this.listeners['connect'] ) {
        this.listeners['connect']();
      }
  }).bind(this));
};

SerialConnection.prototype.on = function(eventType, listener) {
    this.listeners[eventType] = listener;
};



SerialConnection.prototype.onReceive = function(receiveInfo) {
  if (receiveInfo.connectionId !== this.connectionId) {
    console.log("Connection Info wrong ",receiveInfo);
    return;
  }

  this.lineBuffer += ab2str(receiveInfo.data);

  var index;
  while ((index = this.lineBuffer.indexOf('\n')) >= 0) {
    var line = this.lineBuffer.substr(0, index + 1);
    if (  this.listeners['readLine'] ) {
        this.listeners['readLine'](line);
    }
    this.lineBuffer = this.lineBuffer.substr(index + 1);
  }
};

SerialConnection.prototype.onReceiveError = function(errorInfo) {
  if (errorInfo.connectionId === this.connectionId) {
    if (  this.listeners['error'] ) {
        this.listeners['error'](errorInfo.error);
    }
  }
};


SerialConnection.prototype.send = function(msg) {
  if (this.connectionId < 0) {
    console.log('Invalid connection', connectionId);
  } else {
      serial.send(this.connectionId, str2ab(msg), function() {});
  }
};

SerialConnection.prototype.disconnect = function() {
    if (this.connectionId < 0) {
        console.log('Invalid connection', connectionId);
    } else {
        console.log("disconnecting ", this.connectionId);
        serial.disconnect(this.connectionId, (() => {
            console.log("disconnected ", this.connectionId);
            this.connectionId = -1;
            if (  this.listeners['disconnect'] ) {
                this.listeners['disconnect']();
            }
            chrome.serial.onReceive.removeListener(this.boundOnReceive);
            chrome.serial.onReceiveError.removeListener(this.boundOnReceiveError);
        }).bind(this));
    }
};

  exports.SerialConnection = SerialConnection;

})(window);