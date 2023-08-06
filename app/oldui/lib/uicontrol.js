"use strict";

require("core-js/modules/es6.function.name.js");
require("core-js/modules/es6.array.for-each.js");
// quick terminal->textarea simulation
var log = function () {
  var area = document.querySelector("#serverlog");
  var output = function output(str) {
    if (str.length > 0 && str.charAt(str.length - 1) != '\n') {
      str += '\n';
    }
    area.innerText = str + area.innerText;
    if (console) console.log(str);
  };
  return {
    output: output
  };
}();

// get the background page and bind 
// ui components to it.
console.log("Getting Backgroung page");
chrome.runtime.getBackgroundPage(function (bgPage) {
  console.log("Got background page", bgPage);
  bgPage.log.addListener(function (str) {
    log.output(str);
  });
  bgPage.TcpServer.getNetworkAddresses(function (list) {
    var addr = document.querySelector("#addresses");
    for (var i = 0; i < list.length; i++) {
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(list[i].address)) {
        var option = document.createElement('option');
        option.text = list[i].name + " (" + list[i].address + ")";
        option.value = list[i].address;
        addr.appendChild(option);
      }
    }
    ;
  });

  // Populate the list of available devices
  var refreshPorts = function refreshPorts() {
    bgPage.SerialConnection.getDevices(function (ports) {
      // get drop-down port selector
      var dropDown = document.querySelector('#port_list');
      // clear existing options
      dropDown.innerHTML = "";
      // add new options
      ports.forEach(function (port) {
        var displayName = port["displayName"] + "(" + port.path + ")";
        if (!displayName) displayName = port.path;
        var newOption = document.createElement("option");
        newOption.text = displayName;
        newOption.value = port.path;
        dropDown.appendChild(newOption);
      });
    });
  };
  refreshPorts();
  document.getElementById('refreshPorts').addEventListener('click', refreshPorts);
  document.getElementById('openSerial').addEventListener('click', function () {
    var devicePath = document.getElementById("port_list").value;
    bgPage.openConnection(devicePath);
    document.getElementById("devicePath").innerText = devicePath;
    document.querySelector("#serial").className = "opened";
  });
  document.getElementById('closeSerial').addEventListener('click', function () {
    var devicePath = document.getElementById("port_list").value;
    bgPage.closeConnection(devicePath);
    document.getElementById("devicePath").innerText = "";
    document.querySelector("#serial").className = "";
  });
  var setConnectedState = function setConnectedState(addr, port) {
    document.querySelector(".serving-at").innerText = addr + ":" + port;
    document.querySelector("#server").className = "connected";
  };
  document.getElementById('serverStart').addEventListener('click', function () {
    var addr = document.getElementById("addresses").value;
    var port = parseInt(document.getElementById("serverPort").value);
    setConnectedState(addr, port);
    bgPage.startServer(addr, port);
  });
  document.getElementById('serverStop').addEventListener('click', function () {
    document.querySelector("#server").className = "";
    bgPage.stopServer();
  });
  var currentState = bgPage.getServerState();
  if (currentState.isConnected) {
    setConnectedState(currentState.addr, currentState.port);
  }
});