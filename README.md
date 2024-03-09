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


# CandleLight NMEA2000 USB adapter.

This code will use either a NMEA0183 serial adapter or a direct NMEA2000 connection using a CandleLight USBCAN 
Adapter. NMEA2000 is the default. The code uses https://github.com/ieb/candleLightJS.git which is a node js 
implementation of the Linux gs_usb or CanSocket kernel driver.  CandleLightJS will probably also work in a 
browser as it uses WebUSB APIs only. This ensures that the code will work on OSX and ChromeOS which have no 
support for this device in the kernel, and no reasonable way of adding it. 

To get the most from candleLightJS use https://github.com/ieb/candleLight_fw from the withFilters branch which 
adds CAN message filtering by PGN into the firmware. This ensures that only the messages of interest are read 
by the app and any other messages re dropped in the firmware. This significantly lowers power consumption in the app when connected to a busy can bus.


To use NMEA0183 provide a NMEA0183 source on a serial port, and modify the code to enable NMEA0183 processing. search for props.enableNMEA0183.

# ChromeOS 

## USB 

To allow the Can device to be passed through to the linux container enable the Chrome OS flags 

     #permissive-usb-passthrough 
     #cras-split-alsa-usb-internal


Restart. If you dont get a popup to attach the device to linux when plugged in, restart again.
If you get an error about the DISPLAY not being set restart again.

Do not set #enable-unrestricted-usb as this seems to deny Linux the ability to run any apps that use the display.

ChromeOS is flaky, mostly because its been so locked down that a lot of things that normally work, dont, especially anything that Google in their wisdom thought no one would need. Turns out, not every USB device is a hard disk!

## Building

For some reason, node or at least the links that allow it to run get wiped out each time the LCX container starts. To fix, use nvm install --lts=Iron 




# Plans/Todo

* [x] Fixed tcp server
* [x] Confirm works on ChromeOS
* [x] Finish testing.
* [x] Write a gs_usb driver to read NMEA2000 bytes directly from the CAN bus via one of the cheap, very low power, USB-Can adapters (eg CandelLite). The firmware is available in source code which reveals the USB protocol, so no USB drivers needed (they are not available in ChromeOS). There is also a Python module that uses usblib to access gs_usb.
* [x] Allow maximise 1 cell 
* [x] Soak test on ChromeOS for > 48h
* [x] Make it easier to find out which port and how many clients, its really hard at the moment due to LXC, but the App knows which IP its on, even if its almost impossible to find out in ChromeOS.
* [x] Support UDP -- unfortunately UDP broadcasts won't propagate between containers on ChromeOS, so code works, but not using. Sticking to TCP. Almost all NMEA clients listen for UDP packets and the sender cant know where to send them directly.
* [x] Implement playback functionality to replay real NMEA2000 packets
* [ ] Write a B&G view.
* [ ] Do some fun visualizations, charts, etc.


# Bugs since switch to NMEA2000 

* [x] AWA shows S336 instead of P24
* [x] Pitch is not P or S 
* [x] enginCoolantTemperature doesn't fit in display
* [x] alternatorVoltage 
* [x] Not sure log and trip are displaying correctly.
* [x] Latitude and longitude should be together in 1 instrument.
* [x] Days and seconds since midnight should display as time. (gpsDaysSince1970, gpsSecondsSinceMidnight)
* [x] current_1, temperature_1, temperature_0 when selected break the text box.
* [x] swrt, lastCalc, lastChange needs to be dropped, not relevant.
* [x] Pitch P/S makes no sense.
* [x] Min max graphs do not appear to be scaling right.
* [x] dbt needs a graph
* [x] Engine coolant needs a graph
* [x] Voltages need a graph
* [x] Currents need a graph
* [x] Pressure graph
* [x] Fuel level graph
* [x] atmosphericPressure is too long
* [x] Calcs not firing. 
* [x] NMEA0183 sentences were not being parsed correctly for some apps
* [x] Fix packaging so that serialport and usb are included in the binary.
* [x] When UI reloads it doesn't remember state of backend can connection or tcp server.  Now the TCP server and NMEA2000 are managed automatically in the backend.
* [x] Remove NMEA0183 reader code from AppMain.
* [x] When the NMEA2000 USB connection encounters an error it should close the USB device and reopen. 2 types seen so far. LIBUSB_ERROR_NO_DEVICE on transfer and a timeout on packets received. There should be some way of pinging the USB layer to check that the device is still there and operational.
* [x] On exit the native usb driver thread tries to close, but has already closed causing a segv. It should be resilient to this as any exit will cause the same. Fix will need to be in the c code.  The fix is to ensure that will-quit event does not exit before shutdown has happened by calling event.preventDefault before returning the event. Then the normal close of the usb can take place and complete before the c pointers become invalid and cause a segv. There are a number of threads in the c usb lib that do not close automatically and do not block the nodeJS main thread.
* [x] Fix editiing widgets. Only when the key is updated, will a component be recreated. IIUC, if this is set explicitly, if should reflect all the properties otherwise changes to properties will be ignored by React. Simple fix was to make the key depend on the edited property. 
* [ ] Fix playback to use raw NMEA packets rather than the current parsed packets, this needs the packets to be written out correctly, and this needs a menu item to start recording.
* [ ] Fix Lookup missing balue gnssType 15 seen on Raymarine bus.
* [ ] Fix Lookup missing value xteMode 15 seen on Raymarine bus.
* [ ] NADoubleN2K is not being handled properly. When received after a valid value is present, it should not flip flop as it does with the playback of rudder from a real feed. Need to add some logic to the updates in the store, so that NA only takes effect after a timeout period.

