const { ipcMain, ipcRenderer } = require('electron');

const bindMainAPI = (main) => {
    ipcMain.handle('mainAPI->getNetworkAddresses', main.getNetworkAddresses),
    ipcMain.handle('mainAPI->getDevices', main.getDevices),
    ipcMain.handle('mainAPI->stopServer', main.stopServer),
    ipcMain.handle('mainAPI->closeConnection', main.closeConnection),
    ipcMain.handle('mainAPI->startServer', main.startServer),
    ipcMain.handle('mainAPI->openConnection', main.openConnection),
    ipcMain.handle('mainAPI->getPacketsRecieved', main.getPacketsRecieved)
};

const bindStoreAPI = (store) => {
    ipcMain.handle('storeApi->getState', store.getState),
    ipcMain.handle('storeApi->getHistory', store.getHistory),
    ipcMain.handle('storeApi->getKeys', store.getKeys)
};

export { bindMainAPI, bindStoreAPI};