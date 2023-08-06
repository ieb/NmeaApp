
import ReactDOM from 'react-dom/client';
import React from 'react';
import { NMEALayout } from './layout.jsx';
import { WebAppBgPage } from './webappbgpage.js';

const rootElement = document.getElementById('root');
console.log("Root element is ", rootElement)
const root = ReactDOM.createRoot(rootElement);
console.log("React Root is ",root);


/* setup for a web page view which has not background page */
if ( chrome !== undefined && chrome.runtime !== undefined && ( typeof chrome.runtime.getBackgroundPage === "function") ) {

    // running as a chrome app.
    // The handling of the the nmea message streams will be in the background app
    // so that it can continue to send messages to tcp clients.
    // store also needs to be on the background page

    chrome.runtime.getBackgroundPage((bgPage) => {
        console.log("Got BGPage as", bgPage);
        console.log("Got BGPage.getStore is a ", typeof bgPage.getStore);
        console.log("Got BGPage.getStore()", bgPage.getStore());
        root.render(<NMEALayout bgPage={bgPage} > </NMEALayout>);
    });


} else {

    const bgPage = new WebAppBgPage();
    root.render(<NMEALayout bgPage={bgPage} > </NMEALayout>);

}



