const fs = require('fs');
const path = require('path');
const glob = require('glob');
const child_process = require('child_process');
const mainConfig = require('./webpack.main.config.js');
const renderConfig = require('./webpack.renderer.config.js');


module.exports = {
  packagerConfig: {
    asar: true,
    interactive: true
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        devContentSecurityPolicy: 'default-src \'self\' \'unsafe-inline\' data:; script-src \'self\' \'unsafe-eval\' \'unsafe-inline\' data:',        
        mainConfig: mainConfig,
        renderer: {
          config: renderConfig,
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
              },
            },
          ],
        },
      },
    },
  ],
  hooks: {
    // from https://github.com/serialport/node-serialport/issues/2464
    // https://github.com/Dygmalab/Bazecor/blob/development/forge.config.ts
    // serial port and usb need to be external to use the pre-build binaries,
    // as these cannot be webpacked, and @vercel/webpack-asset-relocator-loader doesnt work
    // no idea why, its written in Typescript so completely impossible to debug as a npm library, like
    // all typescript based libraries.
    // The solution is to make native npm packages external, which works in development
    // but for packaging it needs additional work to add them to the package, done here.
    // they should appear in node_modules inside the final package.
    packageAfterPrune: async (forgeConfig, buildPath, electronVersion, platform, arch) => {
      /**
       * Serialport, usb are problematic libraries to run in Electron.
       * When Electron app is been built, these libraries are not included properly in the final executable.
       * What we do here is to install them explicitly and then remove the files that are not for the platform
       * we are building for
       */
      const packageJson = JSON.parse(fs.readFileSync(path.resolve(buildPath, "package.json")).toString());

      packageJson.dependencies = {
        serialport: "^12.0.0",
        usb: "^2.11.0",
      };
      packageJson.devDependencies = {
      };

      fs.writeFileSync(path.resolve(buildPath, "package.json"), JSON.stringify(packageJson));
      const npmInstall = child_process.spawnSync("npm", ["install", "--omit=dev"], {
        cwd: buildPath,
        stdio: "inherit",
        shell: true,
      });

      const prebuilds = glob.globSync(`${buildPath}/**/prebuilds/*`);
      const matchString = new RegExp(`prebuilds/${platform}`);
      prebuilds.forEach(function (path) {
        if (!path.match(matchString)) {
          console.log("Removing ",path);
          fs.rmSync(path, { recursive: true });
        }
      });
    },
  },
};
