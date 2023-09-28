
import React from 'react'
import ReactDOM from 'react-dom/client'
import { NMEALayout } from './layout.jsx';

const rootElement = document.getElementById('root');
console.log("Root element is ", rootElement)
const root = ReactDOM.createRoot(rootElement);
console.log("React Root is ",root);

if ( !window.mainAPI ) {
    console.log("No Main API provided from preload, check preload, using mock");
    window.mainAPI = {
        getNetworkAddresses: () => { console.log('mainAPI->getNetworkAddresses'); return []},
        getDevices: () => { console.log('mainAPI->getDevices'); return []},
        stopServer: () => { console.log('mainAPI->stopServer'); return true},
        closeConnection: () => { console.log('mainAPI->closeConnection'); return true},
        startServer: (address, port) => { console.log('mainAPI->startServer', address, port); return true},
        openConnection: (baud) => { console.log('mainAPI->openConnection',baud); return true},
        getPacketsRecieved: () => { console.log('mainAPI->getPacketsRecieved'); return 100},
    };

} 
if (!window.storeAPI ) {
    console.log("No storeAPI provided from preload, check preload, using mock");
    window.storeAPI = {
        getState: (field) => {console.log('storeApi->getState',field); return 10;},
        getHistory: (field) => {console.log('storeApi->getHistory',field); return { value: 10, data: [10,11,12]}},
        getKeys: () => {console.log('storeApi->getKeys'); return ['aws'];}       
    };
}

root.render(<NMEALayout mainAPI={window.mainAPI} storeAPI={window.storeAPI} > </NMEALayout>);



