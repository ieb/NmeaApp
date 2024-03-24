import './styles/main.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { NMEALayout } from './layout.jsx';
import { Logs } from './logs.jsx';
import { StoreView, FrameView } from './storeview.jsx';

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
    root.render(<StoreView title="Store" storeAPI={window.storeAPI}  > </StoreView>);
} else if ( window.location.hash ===  "#view-can-frames") { 
    root.render(<FrameView title="CAN Frames" mainAPI={window.mainAPI} > </FrameView>);
} else if ( window.location.hash ===  "#view-can-messages") { 
    root.render(<Logs title="CAN Messages" mainAPI={window.mainAPI} enableFeed={window.mainAPI.onCanMessage} > </Logs>);
} else if ( window.location.hash ===  "#view-debug-logs") { 
    root.render(<Logs title="Debug Logs" mainAPI={window.mainAPI} enableFeed={window.mainAPI.onLogMessage} > </Logs>);
} else {
    root.render(<NMEALayout mainAPI={window.mainAPI} storeAPI={window.storeAPI} > </NMEALayout>);
}



