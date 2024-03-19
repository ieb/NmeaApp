"use strict";
const { Menu, MenuItem, dialog } = require('electron')
const { EventEmitter }  = require('node:events');

class AppMenu extends EventEmitter {

  disableStop() {
        this.openPlayback.enabled = true;
        this.recordPlayback.enabled = true;
        this.stopPlayback.enabled = false;
  }

  enableStop() {
    console.log("Enabling stop");
    this.openPlayback.enabled = false
    this.recordPlayback.enabled = false;
    this.stopPlayback.enabled = true;
  }



  createApplicationMenu(appMain) {


    const isMac = process.platform === 'darwin';
    const emit = this.emit.bind(this);


    this.openPlayback = new MenuItem({
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
              this.emit("click", "file->playbackStart", fileObj.filePaths[0]);
           }
        } catch(err) {
           console.error(err)  
        }
      } 
    });
    this.stopPlayback = new MenuItem({
      label: 'Stop record or playback',
      accelerator: 'CmdOrCtrl+S',
      enabled: false,
       // this is the main bit hijack the click event 
      click: () => {
        this.emit("click", "file->playbackOrCaptureStop");
      } 
    });

    this.recordPlayback = new MenuItem({
      label: 'Record playback...',
      accelerator: 'CmdOrCtrl+R',
      enabled: true,
       // this is the main bit hijack the click event 
      click: async () => {
        // construct the select file dialog 
        try {
          const fileObj = await dialog.showSaveDialog({
            properties: ['createDirectory'],
            title: "Select file to record into",
            nameFieldLabel: 'recording file'
          });
            if (!fileObj.canceled) {
              this.emit("click", "file->captureStart");
           }
        } catch(err) {
           console.error(err)  
        }
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
          this.recordPlayback,
          this.openPlayback,
          this.stopPlayback,
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
          { 
            label: 'Show Store',
            click: async () => { 
              await emit("click", "view->dump-store");
            }
          },
          { 
            label: 'Show Can Stream',
            click: async () => { 
              await emit("click", "view->can-stream");
            }
          },
          { 
            label: 'Show Debug Logs',
            click: async () => { 
              await emit("click", "view->debug-logs");
            }
          },
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