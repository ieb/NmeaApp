"use strict";
const { Menu, MenuItem, dialog } = require('electron')
const { EventEmitter }  = require('node:events');

class AppMenu extends EventEmitter {

  constructor() {
    super();
    this.viewFlags = {
      store: false,
      messages: false,
      frames: false,
      debuglog: false
    };
    this.enabledFlags = {
      openPlayback: true,
      recordPlayback: true,
      stopPlayback: false
    };
    this.menuCreation = 0;
    this.on('click', (e, v) => {
        console.log("Internal Menu click",e);

      switch (e) {

      case 'view->dump-store':
        this.viewFlags.store = !v;
        this.createApplicationMenu();
        break;
      case 'view->can-messages':
        this.viewFlags.messages = !v;
        this.createApplicationMenu();
        break;
      case 'view->can-frames':
        this.viewFlags.frames = !v;
        this.createApplicationMenu();
        break;
      case 'view->debug-logs':
        this.viewFlags.debuglog = !v;
        this.createApplicationMenu();
        break;
      }

    });

  }

  disableStop() {
    this.enabledFlags.openPlayback = true;
    this.enabledFlags.recordPlayback = true;
    this.enabledFlags.stopPlayback = false;
    this.createApplicationMenu();
  }

  enableStop() {
    this.enabledFlags.openPlayback = false;
    this.enabledFlags.recordPlayback = false;
    this.enabledFlags.stopPlayback = true;
    this.createApplicationMenu();
  }



  createApplicationMenu() {

    this.menuCreation++;
    // eslint-disable-next-line no-undef
    const isMac = process.platform === 'darwin';
    const emit = this.emit.bind(this);

    const template = [
      // { role: 'appMenu' }
      ...(isMac
        ? [{
            label: "NMEA2000 ",
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
        label: 'File ',
        submenu: [
          {
            label: 'Record playback...',
            accelerator: 'CmdOrCtrl+R',
            enabled: this.enabledFlags.recordPlayback,
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
          },
          {
            label: 'Open playback...',
            accelerator: 'CmdOrCtrl+O',
            enabled: this.enabledFlags.openPlayback,
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
          },
          {
            label: 'Stop record or playback',
            accelerator: 'CmdOrCtrl+S',
            enabled: this.enabledFlags.stopPlayback,
             // this is the main bit hijack the click event 
            click: () => {
              this.emit("click", "file->playbackOrCaptureStop");
            } 
          },
          isMac ? { role: 'close' } : { role: 'quit' },
          { 
            label: 'New Instrument Window',
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
            label: (this.viewFlags.store)?'Hide Store':'Show Store',
            enabled: true,
            click: async () => { await this.emit("click", "view->dump-store", this.viewFlags.store) }
          },
          {
            label: (this.viewFlags.messages)?'Hide Can Messages':'Show Can Messages',
            enabled: true,
            click: async () => { await this.emit("click", "view->can-messages", this.viewFlags.messages) }
          },
          {
            label:  (this.viewFlags.frames)?'Hide Can Frames':'Show Can Frames',
            enabled: true,
            click: async () => { await this.emit("click", "view->can-frames", this.viewFlags.frames) }
          },
          {
            label: (this.viewFlags.debuglog)?'Hide Debug Logs':'Show Debug Logs',
            enabled: true,
            click: async () => { await this.emit("click", "view->debug-logs", this.viewFlags.debuglog) }
          },
          { type: 'separator' },
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


    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

  }
}

export { AppMenu };