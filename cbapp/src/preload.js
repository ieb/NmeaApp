// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mainAPI',{
        getNetworkAddresses: () => ipcRenderer.invoke('mainAPI->getNetworkAddresses'),
        getDevices: () => ipcRenderer.invoke('mainAPI->getDevices'),
        stopServer: () => ipcRenderer.invoke('mainAPI->stopServer'),
        closeConnection: () => ipcRenderer.invoke('mainAPI->closeConnection'),
        startServer: (address, port) => ipcRenderer.invoke('mainAPI->startServer', address, port),
        openConnection: (baud) => ipcRenderer.invoke('mainAPI->openConnection',baud),
        getPacketsRecieved: () => ipcRenderer.invoke('mainAPI->getPacketsRecieved'),
    });
contextBridge.exposeInMainWorld('storeAPI',{
        getState: async (field) => { return await ipcRenderer.invoke('storeApi->getState',field); },
        getHistory: async (field) => { return await ipcRenderer.invoke('storeApi->getHistory',field); },
        getKeys: async () => { return await ipcRenderer.invoke('storeApi->getKeys'); }       
    });