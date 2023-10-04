# NMEA App

After 2 weeks at sea I discovered that a ancient 8 core ARM based Chromebook would last almost indefinitely running
Navionics Boating App connected to a minimal nodejs tcp server connected over serial though an ESP32 to the boats
CanBus. Powered by a low power USB adapter. CPU typically sits at < 5% and even without the USB adapter connected the
battery lasts 8-9h.

Previous attempts with Grafana, InfluxDB, SignalK on RaspberryPi or Thin Clients all worked but used more power than I
was interested in sacrificing 24x7. And an ESP32 with WiFi + TFT gets into the same ballpark. 

So this project is a sequence of attempts to make a easy to use navigational app that takes the data, makes it available
to Navionics, displays data in real time and uses barely no power. Can also run SailGribWR and other navigation/routing
apps on the same datasource.

On a Chromebook, the nodejs server running in Linux (Penguin container) is ok, and the Linux container ports can be
exposed to Android containers (the Navionics App), but its a pain to start. So I tried a Chrome App, later abandoned.
It worked, got better network access inside the machine but unfortunately Google depreciated the critical APIs with
Version 3 of the manifests and look like deprecating Chrome Apps completely leaving only Chrome Extensions which cant
open TCP servers, for good reason.

Second attempt was to add node js to the base OS via the VT2 Terminal which is now (after ChromeOS 117) the only root
access remaining. Unfortunately the armv8 nodejs is the wrong ELF format and the armv7 nodejs has missing shared libs,
so that's a non starter.  Native ChromeOS does have Python 3.9 and it can be upgraded, but python seems to use too much
power running a Qt based UI compared to Chrome itself.

Almost started an Android app attempt, but the network is too isolated to be exposed to other Android containers so I
didn't.

Then I noticed that Linux apps in the ChromeOS Launcher will behave like Apps, easy to launch and able to run TCP
servers as well as having access to USB at a low level. 

Current attempt is an Electron based app, reusing 90% of the code from the Chrome App code base. The first attemt with
Electron + Vite ended with the main window GPU process unable to communicate over XPC with the main window.... so I
started again with Electron + Webpack (not my favorite packager, but hey everyone else likes it and it works out the
box).

TLDR, NmeaApp contains a mostly working App for Navigational data running in Electron which should work on most
platforms. Its current expects a NMEA0183 stream on a serial port, and exposes that as the same on TCP 10110 which
Navionics can subscribe to. It doesn't need Wifi up to run as will use localhost, so no power wasted... although you
could if you want.

Performance data is calculated from a VPP Polar. The one encoded is for a Pogo1250 (my boat), but there are many others
available.

# Plans/Todo

* [x] Fixed tcp server
* [x] Confirm works on ChromeOS
* [ ] Finish testing.
* [ ] Write a gs_usb driver to read NMEA2000 bytes directly from the CAN bus via one of the cheap, very low power, USB-Can adapters (eg CandelLite). The firmware is available in source code which reveals the USB protocol, so no USB drivers needed (they are not available in ChromeOS). There is also a Python module that uses usblib to access gs_usb.
* [ ] Write a B&G view.
* [ ] Do some fun visualizations, charts, etc.