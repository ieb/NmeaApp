import './styles/main.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { NMEALayout } from './layout.jsx';

const rootElement = document.getElementById('root');
console.log("Root element is ", rootElement)
const root = ReactDOM.createRoot(rootElement);
console.log("React Root is ",root);

if (!window.storeAPI ) {
    console.log("No storeAPI provided from preload, check preload, using mock");
    window.storeAPI = {
        getPacketsRecieved: () => { console.log('storeApi->getPacketsRecieved'); return 100},
        getState: (field) => {console.log('storeApi->getState',field); return 10;},
        getHistory: (field) => {console.log('storeApi->getHistory',field); return { value: 10, data: [10,11,12]}},
        getKeys: () => {console.log('storeApi->getKeys'); return ['aws'];}       
    };
}

root.render(<NMEALayout storeAPI={window.storeAPI} > </NMEALayout>);



