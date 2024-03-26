const process = require('node:process');
const {AppMain } = require('./app/appMain.js');
const readline = require('readline');

/*

Runs only the server part 

*/







// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
const appMain = new AppMain();
appMain.start();


const shutdown = () => {
  return new Promise((resolve) => {
    appMain.shutdown(() => {
      console.log("Done");
      resolve();
    });
  })
};


// eslint-disable-next-line no-unused-vars
process.on('exit', async (code) => {

    console.log("Got exit");
    await shutdown();
    console.log("Finished exit");
    process.exit();
});
// eslint-disable-next-line no-unused-vars
process.on('SIGTERM', async (code) => {
    console.log("Got term");
    await shutdown();
    console.log("Finished term");
    process.exit();
});


readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on('keypress', async (str, key) => {
    console.log("Pressed ",key);
     if (key.ctrl && key.name === 'c') {
        console.log("shutdown requested ");
        await shutdown();
        process.exit();
    } else {
        console.log("Press ^C to exit, not ",key);
    }
});


