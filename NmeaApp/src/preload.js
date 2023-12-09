// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


const { contextBridge, ipcRenderer } = require('electron');

// Only 1 parameter in each ipc message, the second parameter is an event.
contextBridge.exposeInMainWorld('mainAPI',{
        getNetworkAddresses: () => ipcRenderer.invoke('mainAPI->getNetworkAddresses'),
        getDevices: () => ipcRenderer.invoke('mainAPI->getDevices'),
        stopServer: () => ipcRenderer.invoke('mainAPI->stopServer'),
        closeConnection: () => ipcRenderer.invoke('mainAPI->closeConnection'),
        startServer: (address, port) => ipcRenderer.invoke('mainAPI->startServer', address, port),
        openConnection: (path, baud) => ipcRenderer.invoke('mainAPI->openConnection',path, baud),
        getPacketsRecieved: () => ipcRenderer.invoke('mainAPI->getPacketsRecieved'),
        openNMEA2000: () => ipcRenderer.invoke('mainAPI->openNMEA2000'),
        closeNMEA2000: () => ipcRenderer.invoke('mainAPI->closeNMEA2000'),
    });
contextBridge.exposeInMainWorld('storeAPI',{
        getState: async (field) => { return await ipcRenderer.invoke('storeApi->getState',field); },
        getHistory: async (field) => { return await ipcRenderer.invoke('storeApi->getHistory',field); },
        getKeys: async () => { return await ipcRenderer.invoke('storeApi->getKeys'); }       
    });