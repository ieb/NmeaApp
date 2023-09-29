"use strict";
const { AppMain }  = require('./appMain.js');

function load(app, ipcMain) {
    const appMain = new AppMain();
    app.on("ready", () => {
        ipcMain.handle('mainAPI->getNetworkAddresses', appMain.getNetworkAddresses),
        ipcMain.handle('mainAPI->getDevices', appMain.getDevices),
        ipcMain.handle('mainAPI->stopServer', appMain.stopServer),
        ipcMain.handle('mainAPI->closeConnection', appMain.closeConnection),
        ipcMain.handle('mainAPI->startServer', appMain.startServer),
        ipcMain.handle('mainAPI->openConnection', appMain.openConnection),
        ipcMain.handle('mainAPI->getPacketsRecieved', appMain.getPacketsRecieved)
        ipcMain.handle('storeApi->getState', appMain.store.getState),
        ipcMain.handle('storeApi->getHistory', appMain.store.getHistory),
        ipcMain.handle('storeApi->getKeys', appMain.store.getKeys)
    });
    return appMain;
}

export { load };