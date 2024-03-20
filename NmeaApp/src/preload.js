// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


const { contextBridge, ipcRenderer } = require('electron');

// Only 1 parameter in each ipc message, the second parameter is an event.
// The store API allows polling. This is easy, but not really the best way of doing this.
// it might be better to emit events from the server to the UI.
// onStateChange is not in use currently since the stream of events is 
// still generated by an interval on the mail process rather than driven
// by the messages on the bus on account of recording history.
// On balance, better to poll from the client, but work on reducing the 
// number of ipc calls from rendered to main.
// leaving onStateChange in place for future reference.

contextBridge.exposeInMainWorld('storeAPI',{
        getState: async (field) => { return await ipcRenderer.invoke('storeApi->getState',field); },
        getHistory: async (field) => { return await ipcRenderer.invoke('storeApi->getHistory',field); },
        getKeys: async () => { return await ipcRenderer.invoke('storeApi->getKeys'); },       
        getPacketsRecieved: () => ipcRenderer.invoke('storeApi->getPacketsRecieved'),
        getNmea0183Address: () => ipcRenderer.invoke('storeApi->getNmea0183Address'),
        getConnectedClients: () => ipcRenderer.invoke('storeApi->getConnectedClients'),
        getMessages: () => ipcRenderer.invoke('storeApi->getMessages'),
        addListener: () => ipcRenderer.invoke('storeApi->addListener'),
        removeListener: () => ipcRenderer.invoke('storeApi->removeListener'),
        onStateChange: (callback) => ipcRenderer.on('storeApi->stateChangeEvent', (_event, value) => callback(value)),
    });
contextBridge.exposeInMainWorld('mainAPI',{
        addListener: () => ipcRenderer.invoke('mainApi->addListener'),
        removeListener: () => ipcRenderer.invoke('mainApi->removeListener'),
        onLogMessage: (callback) => ipcRenderer.on('mainApi->logMessage', (_event, value) => {
                callback(value);
        }),
        onFrame: (callback) => ipcRenderer.on('mainApi->frame', (_event, value) => callback(value)),
    });

