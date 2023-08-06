"use strict;"
import React from 'react';

class SerialPortWebAPI extends React.Component {
    constructor(props) {
        super(props);
        this.nmeaHandler = props.nmeaHandler;
        this.state = {
            isOpen: false,
            devicePath: "",
            baud: 9600,
            dataIndicatorOn: false
        };
        this.packetsRecieved = 0;
        this.lastPacketsRecived = 0;
        this.baudList = [
            {id: 0, display: "4800", baud: 4800},
            {id: 1, display: "9600", baud: 9600},
            {id: 2, display: "19200", baud: 19200},
            {id: 3, display: "38400", baud: 38400},
            {id: 4, display: "57600", baud: 57600},
            {id: 5, display: "115200", baud: 115200}
        ];
        this.clickConnect = this.clickConnect.bind(this);
        this.clickDisconnect = this.clickDisconnect.bind(this);
        this.setState = this.setState.bind(this);
        this.selectBaud = this.selectBaud.bind(this);
        this.incPacketsRecieved = this.incPacketsRecieved.bind(this);
        navigator.serial.getPorts((ports) => {
            console.log("Available Ports are ", ports);
        });
    }

    componentDidMount() {
        this.updateInterval = setInterval((() => {
            if (this.lastPacketsRecied !== this.packetsRecieved ) {
                this.lastPacketsRecived = this.packetsRecieved;
                this.setState({dataIndicatorOn: !this.state.dataIndicatorOn});
            }
        }).bind(this), 1000);

    }

    componentWillUnmount() {
        if ( this.updateInterval ) {
            cancelIntervale(this.updateInterval);
        }
    }


    selectBaud(event) {
        this.setState({baudId: event.target.value});
    }




    async clickConnect() {
        this.packetsRecieved = 0;
        try {
            this.port = await navigator.serial.requestPort();
            const devicePath = this.port
            this.port.addEventListener("connect", () => {
                console.log("Connected");
                this.setState({ isOpen: true, packetsRecieved: 0});
            });
            this.port.addEventListener("disconnect", () => {
                console.log("Disconnected");
                this.setState({isOpen: false});
            });
            console.log(this.state.baudId, this.baudList[this.state.baudId]);
            const serialOptions = {
                baudRate: this.baudList[this.state.baudId].baud
            };
            console.log("Opening with ", serialOptions);
            await this.port.open(serialOptions);

            const decoder = new TextDecoderStream();
            this.port.readable.pipeTo(decoder.writable);
            const nmeaDecoder = new TransformStream(new NMEASentenceTransform());
            decoder.readable.pipeTo(nmeaDecoder.writable);

            this.reader = nmeaDecoder.readable.getReader();
            const that = this;
            setTimeout(async () => {
                that.readingState = 0;
                while(that.readingState == 0) {
                    const { done, value } = await that.reader.read();
                    if ( done ) {
                        console.log("Done", done);
                        return;
                    }
                    if ( value !== undefined ) {
                        that.incPacketsRecieved();
                        that.nmeaHandler.parseSentence(value.trim());                                
                    }
                }
                console.log("Stopped");
                that.reader.releaseLock();
                await nmeaDecoder.readable.cancel();
                setTimeout( async () => {
                    await that.port.close();
                    that.setState({isOpen: false, devicePath: ""});
                }, 100);
            }, 100);            
            this.setState({isOpen: true, packetsRecieved: 0, devicePath: devicePath});
        } catch (e) {
            console.log(e);
        }
    }

    incPacketsRecieved() {
        this.packetsRecieved++;
    } 

    clickDisconnect() {
        this.readingState = 1;
    }


    render() {
        if ( this.state.isOpen ) {
            const indicatorClass = this.state.dataIndicatorOn?"iOn":"iOff";
            return (
                <div className="serialPortControl" >
                    <div className={indicatorClass}>{"\u2299"}</div>
                    <p>Connected at <span className="baudRate" >{this.state.baud}</span> baud
                    </p>
                    <button onClick={this.clickDisconnect} >{"\u2715"}</button>
                </div>
            );
        } else {
            const selectBaud = this.baudList.map((baud) => <option key={baud.id} value={baud.id} >{baud.display}</option>);
            return (
                <div className="serialPortControl" >
                  <select onChange={this.selectBaud} value={this.state.baudId} >
                  {selectBaud}
                  </select>
                  <button onClick={this.clickConnect} >{"\u25BA"}</button>
                </div>
            );                
        }   
    }
}



export { SerialPortWebAPI };
