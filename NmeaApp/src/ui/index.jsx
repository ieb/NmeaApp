import './styles/main.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { NMEALayout } from './layout.jsx';
import { Logs } from './logs.jsx';

const rootElement = document.getElementById('root');
console.log("Root element is ", rootElement)
const root = ReactDOM.createRoot(rootElement);
console.log("React Root is ",root);
console.log("Location is ", window.location);



if (!window.storeAPI ) {
    console.log("No storeAPI provided from preload, check preload, using mock");
    window.storeAPI = {
        getPacketsRecieved: () => { console.log('storeApi->getPacketsRecieved'); return 100},
        getState: (field) => {console.log('storeApi->getState',field); return 10;},
        getHistory: (field) => {console.log('storeApi->getHistory',field); return { value: 10, data: [10,11,12]}},
        getKeys: () => {console.log('storeApi->getKeys'); return ['aws'];}       
    };
}
if ( !window.mainAPI ) {
    console.log("No mainAPI provided from preload, check preload");

}

if ( window.location.hash ===  "#view-dump-store") {

    root.render(<h1>View DumpStore</h1>);
} else if ( window.location.hash ===  "#view-can-stream") { 
    root.render(<h1>View CanStream</h1>);
} else if ( window.location.hash ===  "#view-debug-logs") { 
    root.render(<Logs mainAPI={window.mainAPI} > </Logs>);
} else {
    root.render(<NMEALayout storeAPI={window.storeAPI} > </NMEALayout>);
}



