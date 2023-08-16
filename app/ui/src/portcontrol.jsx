"use strict;"
import React from 'react';


class PortControl extends React.Component {
    constructor(props) {
        super(props);
        this.bgPage = props.bgPage;
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
        this.clickRefresh = this.clickRefresh.bind(this);

        (async () => {
            await this.clickRefresh();
        })();


    }

    componentDidMount() {
        this.updateInterval = setInterval((() => {
            const packetsRecieved = this.bgPage.getPacketsRecieved();
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


    async clickDisconnect(event) {
        await this.bgPage.stopServer();
        await this.bgPage.closeConnection();
        this.setState({
            isOpen: false
        });
    }
    async clickConnect(event) {
        if ( this.state.hasNetList ) {
            console.log("Open TCP");
            await this.bgPage.startServer(this.state.netList[this.state.netId].address, this.state.portNo);
            console.log("TCP Open, Open serial ");
            await this.bgPage.openConnection(this.baudList[this.state.baudId].baud,this.state.deviceList[this.state.deviceId].path);
            console.log("Serial Open");
            const serialDevice = `${this.state.deviceList[this.state.deviceId].path} ${this.baudList[this.state.baudId].baud}`;
            const endpoint = `${this.state.netList[this.state.netId].address}:${this.state.portNo}`;
            this.setState({
                isOpen: true,
                serialDevice,
                endpoint
            });

        } else {
            console.log("State is ",this.state);
            const baudRate = this.baudList[this.state.baudId].baud;
            const isOpen = await this.bgPage.openConnection(baudRate);
            this.setState({
                isOpen: isOpen,
                baudRate : baudRate
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
    async clickRefresh(event) {
        const list = await this.bgPage.getNetworkAddresses();
        const ports = await  this.bgPage.getDevices();
        console.log("Got Devices", list);
        console.log("Got Ports", ports);
        const networkList = [];
        const deviceList = [];
        const hasNetList = (list !== undefined);
        const hasDeviceList = (ports !== undefined);
        if ( hasNetList ) {
            for (var i = 0; i < list.length; i++) {
              if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(list[i].address)) {
                networkList.push({
                    id: i,
                    display: list[i].name + " (" + list[i].address + ")",
                    address: list[i].address
                });
              }
            }            
        }
        if ( hasDeviceList ) {
            for(let i = 0; i < ports.length; i++ ) {
                let displayName = ports[i].path;
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
            return (
                <p>Serial:  <span className="running" >{this.state.serialDevice}</span> 
                   Tcp: <span className="running" >{this.state.endpoint}</span>
                </p>
            );
        } else {
            return (
                <p>
                Connected at <span className="running" >{this.state.baudRate}</span> 
                </p>
            );
        }

    }
    render() {
        if ( this.state.isOpen ) {
            const indicatorClass = this.state.dataIndicatorOn?"iOn":"iOff";
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
            return (
                <div className="controls serialPortControl" >
                  {this.dropDown(this.state.hasDeviceList, this.state.deviceList,this.state.deviceId,this.selectDevice)}
                  {this.dropDown(true, this.baudList, this.state.baudId,this.selectBaud)}
                  {this.dropDown(this.state.hasNetList, this.state.netList,this.state.netId,this.selectNet)}
                  {this.hasNetList?(<input type="number" value={this.state.portNo} onChange={this.setPort}/>):""}
                  <button onClick={this.clickConnect} title="connect">{"\u25BA"}</button>
                  {this.state.hasNetList?(<button onClick={this.clickRefresh} title="refresh" >{"\u21BA"}</button>):""}
                </div>
            );                
        }   
    }
}


export { PortControl }