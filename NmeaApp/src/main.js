const { app, BrowserWindow, ipcMain } = require('electron');
const { AppMenu } = require('./menu.js');
const process = require('node:process');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}



const createWindow = (title, entryPoint) => {
  console.log("Create Window Called.");
  entryPoint = (entryPoint === undefined)?"":"#"+entryPoint;
  title = title || 'Instruments';
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: title,
    width: 1000,
    height: 600,
    webPreferences: {
      // eslint-disable-next-line no-undef
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  // eslint-disable-next-line no-undef
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY+entryPoint);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
  return mainWindow;
};



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
let mainAppWindow = undefined;
app.on('ready', () => {
  mainAppWindow = createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('menu-will-show', (e) => {
  console.log("menu-will-show", e);
});

app.on('menu-will-close', (e) => {
  console.log("menu-will-close", e);
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
const {load} = require('./app/appLoader.js');
const appMain = load(app, ipcMain);
const openWindows = {};
const appMenu = new AppMenu();
appMenu.on("click", async (e, obj) => {
  console.log("Menu click",e);
  switch (e) {
  case 'file->new-window':
    createWindow();
    break;
  case "view->dump-store":
    if ( !obj ) {
      openWindows.dumpStoreWindow = createWindow('NMEA Store',"view-dump-store");
      openWindows.dumpStoreWindow.once('close', () => {
        openWindows.dumpStoreWindow  = undefined;
        console.log(appMenu.viewFlags);
        if ( appMenu.viewFlags.store ) {
          appMenu.viewFlags.store = false;
          appMenu.createApplicationMenu();
        }
      });
    } else if ( openWindows.dumpStoreWindow  ) {
      openWindows.dumpStoreWindow .close();
      openWindows.dumpStoreWindow  = undefined;
    }
    break;
  case "view->can-messages":
    if ( !obj ) {
      openWindows.canMessagesWindow = createWindow('CAN Messages',"view-can-messages");
      openWindows.canMessagesWindow.once('close', () => {
        openWindows.canMessagesWindow  = undefined;
        if ( appMenu.viewFlags.messages ) {
          appMenu.viewFlags.messages = false;
          appMenu.createApplicationMenu();
        }
      });
    } else if ( openWindows.canMessagesWindow  ) {
      openWindows.canMessagesWindow .close();
      openWindows.canMessagesWindow  = undefined;
    }
    break;
  case "view->can-frames":
    if ( !obj ) {
      openWindows.canFramesWindow = createWindow('CAN Frames',"view-can-frames");
      openWindows.canFramesWindow.once('close', () => {
        openWindows.canFramesWindow  = undefined;
        if ( appMenu.viewFlags.frames ) {
          appMenu.viewFlags.frames = false;
          appMenu.createApplicationMenu();
        }
      });
    } else if ( openWindows.canFramesWindow  ) {
      openWindows.canFramesWindow .close();
      openWindows.canFramesWindow  = undefined;
    }
    break;
  case "view->debug-logs":
    if ( !obj ) {
      openWindows.debugLogsWindow = createWindow('Debug Log',"view-debug-logs");
      openWindows.debugLogsWindow.once('close', () => {
        openWindows.debugLogsWindow  = undefined;
        if ( appMenu.viewFlags.debuglog ) {
          appMenu.viewFlags.debuglog = false;
          appMenu.createApplicationMenu();
        }
      });
    } else if ( openWindows.debugLogsWindow  ) {
      openWindows.debugLogsWindow .close();
      openWindows.debugLogsWindow  = undefined;
    }
    break;
  case "file->captureStart":
    if ( await appMain.captureStart(obj) ) {
      appMenu.enableStop();
    }
    break;
  case "file->playbackOrCaptureStop":
    await appMain.playbackStop();
    await appMain.captureStop();
    appMenu.disableStop();
    break;
  case "file->playbackStart":
    if ( await appMain.playbackStart(obj) ) {
      mainAppWindow.title = "Instruments ("+path.basename(obj)+")";
      appMenu.enableStop();
      appMain.once("playbackEnd", () => {
        mainAppWindow.title = "Instruments ";
        appMenu.disableStop();
      });      
    }
    break;
  }
});

appMenu.createApplicationMenu();

appMain.start();

app.on('will-quit', (e) => {
  appMain.shutdown(() => {
    console.log("Calling Application exit");
    app.exit();
  });
  e.preventDefault();
  return e;
});

