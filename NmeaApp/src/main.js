const { app, BrowserWindow, ipcMain } = require('electron');
const { AppMenu } = require('./menu.js');
const process = require('node:process');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (entryPoint) => {
  console.log("Create Window Called.");
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  entryPoint = (entryPoint === undefined)?"":"#"+entryPoint;

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY+entryPoint);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

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

const appMenu = new AppMenu();
appMenu.on("click", async (e, obj) => {
  console.log("Menu click",e);
  switch (e) {
  case 'file->new-window':
    createWindow();
    break;
  case "view->dump-store":
    createWindow("view-dump-store");
    break;
  case "view->can-stream":
    createWindow("view-can-stream");
    break;
  case "view->debug-logs":
    createWindow("view-debug-logs");
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
      appMenu.enableStop();      
    }
    break;
  }
});

appMenu.createApplicationMenu(appMain);

appMain.start();

app.on('will-quit', (e) => {
  appMain.shutdown(() => {
    console.log("Calling Application exit");
    app.exit();
  });
  e.preventDefault();
  return e;
});

