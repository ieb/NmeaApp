"use strict";
const { Menu, MenuItem, dialog } = require('electron')
const { EventEmitter }  = require('node:events');

class AppMenu extends EventEmitter {



  createApplicationMenu(appMain) {


    const isMac = process.platform === 'darwin';
    const emit = this.emit.bind(this);
    let playbackRunning = false;

    const openPlayback = new MenuItem({
      label: 'Open playback...',
      accelerator: 'CmdOrCtrl+O',
      enabled: true,
       // this is the main bit hijack the click event 
      click: async () => {
        // construct the select file dialog 
        try {
          const fileObj = await dialog.showOpenDialog({
            properties: ['openFile']
          });
           if (!fileObj.canceled) {
             if ( await appMain.startPlayback(fileObj.filePaths[0]) ) {
                console.log("Enabling stop");
                openPlayback.enabled = false;
                stopPlayback.enabled = true;
             } else {
              console.log("Not playing");
             }

           }
        } catch(err) {
           console.error(err)  
        }
      } 
    });
    const stopPlayback = new MenuItem({
      label: 'Stop playback',
      enabled: false,
       // this is the main bit hijack the click event 
      click: async () => {
        // construct the select file dialog 
        await appMain.stopPlayback();
        console.log("Disable stop");
        openPlayback.enabled = true;
        stopPlayback.enabled = false;
      } 
    });


    const template = [
      // { role: 'appMenu' }
      ...(isMac
        ? [{
            label: "NMEA2000",
            submenu: [
              { role: 'about' , },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          }]
        : []),
      // { role: 'fileMenu' }
      {
        label: 'File',
        submenu: [
          openPlayback,
          stopPlayback,
          isMac ? { role: 'close' } : { role: 'quit' },
          { 
            label: 'New Window',
            click: async () => { 
              await emit("click", "file->new-window");
            }
          }
        ]
      },
      // { role: 'editMenu' }
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          ...(isMac
            ? [
                { role: 'pasteAndMatchStyle' },
                { role: 'delete' },
                { role: 'selectAll' },
                { type: 'separator' },
                {
                  label: 'Speech',
                  submenu: [
                    { role: 'startSpeaking' },
                    { role: 'stopSpeaking' }
                  ]
                }
              ]
            : [
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' }
              ])
        ]
      },
      // { role: 'viewMenu' }
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      // { role: 'windowMenu' }
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
          ...(isMac
            ? [
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'window' }
              ]
            : [
                { role: 'close' }
              ])
        ]
      },
      {
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click: async () => {
              const { shell } = require('electron')
              await shell.openExternal('https://electronjs.org')
            }
          }
        ]
      }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

  }
}

export { AppMenu };