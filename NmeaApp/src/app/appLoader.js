"use strict";
const { AppMain }  = require('./appMain.js');

function load(app, ipcMain) {
    const appMain = new AppMain();
    app.on("ready", () => {
        ipcMain.handle('mainAPI->getNetworkAddresses', async (event, ...args) => {
            return await appMain.getNetworkAddresses(...args);
        }),
        ipcMain.handle('mainAPI->getDevices', async (event, ...args) => {
            return appMain.getDevices(...args);
        }),
        ipcMain.handle('mainAPI->stopServer', async (event, ...args) => {
            return appMain.stopServer(...args);
        }),
        ipcMain.handle('mainAPI->closeConnection',  async (event, ...args) => {
            return appMain.closeConnection(...args);
        }),
        ipcMain.handle('mainAPI->startServer',  async (event, ...args) => {
            return  appMain.startServer(...args);
        }),
        ipcMain.handle('mainAPI->openConnection',  async (event, ...args) => {
            return  appMain.openConnection(...args);
        }),
        ipcMain.handle('mainAPI->getPacketsRecieved',  async (event, ...args) => {
            return  appMain.getPacketsRecieved(...args);
        }),
        ipcMain.handle('storeApi->getState',  async (event, ...args) => {
            return  appMain.store.getState(...args);
        }),
        ipcMain.handle('storeApi->getHistory',  async (event, ...args) => {
            return  appMain.store.getHistory(...args);
        }),
        ipcMain.handle('storeApi->getKeys',  async (event, ...args) => {
            return  appMain.store.getKeys(...args);
        })
    });
    return appMain;
}

export { load };