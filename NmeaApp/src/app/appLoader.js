"use strict";
const { AppMain }  = require('./appMain.js');

function load(app, ipcMain) {
    const appMain = new AppMain({ captureLog: true});
    app.on("ready", () => {
        ipcMain.handle('storeApi->getNmea0183Address',  async (event, ...args) => {
            return appMain.getNmea0183Address(...args);
        });
        ipcMain.handle('storeApi->getConnectedClients',  async (event, ...args) => {
            return appMain.getConnectedClients(...args);
        });
        ipcMain.handle('storeApi->getPacketsRecieved',  async (event, ...args) => {
            return appMain.getPacketsRecieved(...args);
        });
        ipcMain.handle('storeApi->getState',  async (event, ...args) => {
            return appMain.store.getState(...args);
        });
        ipcMain.handle('storeApi->getMessages',  async (event, ...args) => {
            return appMain.store.getMessages(...args);
        });
        ipcMain.handle('storeApi->getHistory',  async (event, ...args) => {
            return appMain.store.getHistory(...args);
        });
        ipcMain.handle('storeApi->getKeys',  async (event, ...args) => {
            return appMain.store.getKeys(...args);
        });
        ipcMain.handle('storeApi->addListener', async (event, ...args) => {
            return appMain.store.addWebListener(event, ...args);
        });
        ipcMain.handle('storeApi->removeListener', async (event, ...args) => {
            return appMain.store.removeWebListener(event, ...args);
        });
        ipcMain.handle('mainApi->addListener', async (event, ...args) => {
            return appMain.addWebListener(event, ...args);
        });
        ipcMain.handle('mainApi->removeListener', async (event, ...args) => {
            return appMain.removeWebListener(event, ...args);
        });

    });


    return appMain;
}

export { load };