import React from 'react';
import PropTypes from 'prop-types';


class PortControl extends React.Component {
    static propTypes = {
        mainAPI: PropTypes.object,
        nmea0183: PropTypes.bool
    };


    constructor(props) {
        super(props);
        this.mainAPI = props.mainAPI;
        this.nmea0183 = props.nmea0183;
        this.lastPacketsRecived;
        this.state = {
            deviceId: 0,
            baudId: 0,
            netId: 0,
            serialDevice: "-",
            dataIndicatorOn: false,
            endpoint: "-",
            portNo: 10110,
            baudRate: 4800,
            hasNetList: false,
            hasDeviceList: false,
            deviceList: [],
            netList: [],

        };

        this.baudList = [
            {id: 0, display: "9600", baud: 9600},
            {id: 1, display: "19200", baud: 19200},
            {id: 2, display: "38400", baud: 38400},
            {id: 3, display: "57600", baud: 57600},
            {id: 4, display: "115200", baud: 115200},
            {id: 5, display: "4800", baud: 4800}
        ]; 
           


        this.clickDisconnect = this.clickDisconnect.bind(this);
        this.clickConnect = this.clickConnect.bind(this);
        this.selectDevice = this.selectDevice.bind(this);
        this.selectBaud = this.selectBaud.bind(this);
        this.selectNet = this.selectNet.bind(this);
        this.clickRefresh = this.clickRefresh.bind(this);

        (async () => {
            await this.clickRefresh();
        })();


    }

    componentDidMount() {
        this.updateInterval = setInterval((async () => {
            const packetsRecieved = await this.mainAPI.getPacketsRecieved();
            if (this.lastPacketsRecived !== packetsRecieved ) {
                this.lastPacketsRecived = packetsRecieved;
                this.setState({dataIndicatorOn: !this.state.dataIndicatorOn});
            }
        }).bind(this), 1000);

    }

    componentWillUnmount() {
        if ( this.updateInterval ) {
            clearInterval(this.updateInterval);
        }
    }


    // eslint-disable-next-line  no-unused-vars 
    async clickDisconnect(event) {
        this.setState({
            closing: true
        });
        await this.mainAPI.stopServer();
        if ( this.nmea0183 ) {
            await this.mainAPI.closeConnection();
        } else {
            await this.mainAPI.closeNMEA2000();
        }
        this.setState({
            closing: false,
            isOpen: false
        });
    }
    // eslint-disable-next-line  no-unused-vars 
    async clickConnect(event) {
        if ( this.state.hasNetList ) {
            const address = this.state.netList[this.state.netId].address;
            console.log("Open TCP", address, this.state.netId, this.state.netList);
            await this.mainAPI.startServer( address, this.state.portNo);
            console.log("TCP Open");            
            const endpoint = `${address}:${this.state.portNo}`;
            this.setState({
                endpoint
            });
        } else {
            console.log("No Network list available");
        }
        if ( this.nmea0183 ) {
            console.log("baudList is ", this.baudList, this.state.baudId, this.baudList[this.state.baudId]);
            if ( this.state.hasDeviceList ) {
                console.log("Open serial ");            
                await this.mainAPI.openConnection(this.state.deviceList[this.state.deviceId].path,this.baudList[this.state.baudId].baud);
                console.log("Serial Open");
                const serialDevice = `${this.state.deviceList[this.state.deviceId].path} ${this.baudList[this.state.baudId].baud}`;
                this.setState({
                    isOpen: true,
                    serialDevice
                });
            } else {
                console.log("No device available.");
            }
        } else {
            await this.mainAPI.openNMEA2000();
            this.setState({
                isOpen: true
            });
        }
    }


    selectDevice(event) {
        this.setState({deviceId: event.target.value});
    }
    selectBaud(event) {
        this.setState({baudId: event.target.value});
    }
    selectNet(event) {
        this.setState({netId: event.target.value});
    }
    setPort(event) {
        this.setState({portNo: event.target.value});
    }
    // eslint-disable-next-line  no-unused-vars 
    async clickRefresh(event) {
        const networks = await this.mainAPI.getNetworkAddresses();
        const ports = await  this.mainAPI.getDevices();
        console.log("Got Network Devices", networks);
        console.log("Got Ports", ports);
        const networkList = [];
        const deviceList = [];
        const hasNetList = (networks !== undefined);
        if ( hasNetList ) {
            for (var k in networks) {
              const addresses = networks[k];

              for (var i = 0; i < addresses.length; i++) {
                if ( addresses[i].family == 'IPv4' && addresses[i].address !== "127.0.0.1" ) {

                    networkList.push({
                        id: networkList.length,
                        display: k + " (" + addresses[i].address + ")",
                        address: addresses[i].address
                    });
                }
              }
            }  
            networkList.push({
                id: networkList.length,
                display: "lo0 (127.0.0.1)",
                address: "127.0.0.1"
            });          
        }
        let hasDeviceList = false;
        if ( this.nmea0183 ) {
            hasDeviceList = (ports !== undefined);
            console.log("Network list", networkList);
            if ( hasDeviceList ) {
                for(let i = 0; i < ports.length; i++ ) {
                    let displayName = ports[i].path;
                    console.log("Port",i,ports[i].path, ports[i].manufacturer );
                    if (ports[i]["displayName"]) {
                        displayName = ports[i]["displayName"] + "(" + ports[i].path + ")";
                    }
                    deviceList.push({
                        id: i,
                        display: displayName,
                        path: ports[i].path
                    });
                }            
            }
        }
        const newState = {
            hasNetList: hasNetList,
            hasDeviceList: hasDeviceList,
            deviceList: deviceList,
            netList: networkList
        };
        console.log("New State", newState);
        this.setState(newState);
    }

    generateList(source) {
        return source.map((item) => <option key={item.id} value={item.id} >{item.display}</option>)
    }
    dropDown(hasList, source,value,onChange) {
        if (hasList) {
            return (
                <select onChange={onChange} value={value} >
                      {this.generateList(source)}
                </select>
            );            
        } else {
            return ( <div></div> );
        }
    }
    showConnection() {
        if (this.state.hasNetList) {
            if ( this.nmea0183) {
                return (
                    <p>Serial:  <span className="running" >{this.state.serialDevice}</span> 
                       Tcp: <span className="running" >{this.state.endpoint}</span>
                    </p>
                );                
            } else {
                return (
                    <p>NMEA2000 -> Tcp: <span className="running" >{this.state.endpoint}</span>
                    </p>
                );                
            }
        } else {

            return (
                <p>
                Connected at <span className="running" >{this.state.baudRate}</span> 
                </p>
            );
        }

    }
    render() {
        if ( this.state.closing ) {
            return (
                <div className="serialPortControl">
                    <div className="controls" >
                        Closing.....
                        {this.showConnection()}
                    </div>
                </div>
            );
        } else if ( this.state.isOpen ) {
            //const indicatorClass = this.state.dataIndicatorOn?"iOn":"iOff";
                    /*<div className={indicatorClass}>{"\u2299"}</div>*/
            return (
                <div className="serialPortControl">
                    <div className="controls" >
                        {this.showConnection()}
                    </div>
                    <div className="controls" >
                        <button onClick={this.clickDisconnect} title="disconnect" >{"\u2715"}</button>
                    </div>
                </div>
            );
        } else {
            if ( this.nmea0183 ) {
                return (
                    <div className="controls serialPortControl" >
                      {this.dropDown(this.state.hasDeviceList, this.state.deviceList,this.state.deviceId,this.selectDevice)}
                      {this.dropDown(true, this.baudList, this.state.baudId,this.selectBaud)}
                      {this.dropDown(this.state.hasNetList, this.state.netList,this.state.netId,this.selectNet)}
                      {this.state.hasNetList?(<input type="number" value={this.state.portNo} onChange={this.setPort}/>):""}
                      <button onClick={this.clickConnect} title="connect">{"\u25BA"}</button>
                      {this.state.hasNetList?(<button onClick={this.clickRefresh} title="refresh" >{"\u21BA"}</button>):""}
                    </div>
                );                
            } else {
                return (
                    <div className="controls serialPortControl" >
                      {this.dropDown(this.state.hasNetList, this.state.netList,this.state.netId,this.selectNet)}
                      {this.state.hasNetList?(<input type="number" value={this.state.portNo} onChange={this.setPort}/>):""}
                      <button onClick={this.clickConnect} title="connect">{"\u25BA"}</button>
                      {this.state.hasNetList?(<button onClick={this.clickRefresh} title="refresh" >{"\u21BA"}</button>):""}
                    </div>
                );
            }
        }   
    }
}


export { PortControl }