// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


const { contextBridge, ipcRenderer } = require('electron');

// Only 1 parameter in each ipc message, the second parameter is an event.

contextBridge.exposeInMainWorld('storeAPI',{
        getState: async (field) => { return await ipcRenderer.invoke('storeApi->getState',field); },
        getHistory: async (field) => { return await ipcRenderer.invoke('storeApi->getHistory',field); },
        getKeys: async () => { return await ipcRenderer.invoke('storeApi->getKeys'); },       
        getPacketsRecieved: () => ipcRenderer.invoke('storeApi->getPacketsRecieved'),
        getMessages: () => ipcRenderer.invoke('storeApi->getMessages')
    });