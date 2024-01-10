"use strict";
const { AppMain }  = require('./appMain.js');

function load(app, ipcMain) {
    const appMain = new AppMain();
    app.on("ready", () => {
        ipcMain.handle('storeApi->getPacketsRecieved',  async (event, ...args) => {
            return appMain.getPacketsRecieved(...args);
        }),
        ipcMain.handle('storeApi->getState',  async (event, ...args) => {
            return appMain.store.getState(...args);
        }),
        ipcMain.handle('storeApi->getHistory',  async (event, ...args) => {
            return appMain.store.getHistory(...args);
        }),
        ipcMain.handle('storeApi->getKeys',  async (event, ...args) => {
            return appMain.store.getKeys(...args);
        })
    });
    return appMain;
}

export { load };