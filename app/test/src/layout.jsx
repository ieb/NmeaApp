"use strict;"
import React from 'react';
import { PortControl } from './portcontrol.jsx';

class DisplayConverters {
    static relativeAngle(v) {
        if ( v == undefined ) {
            return "--";
        }
        if(v < 0) {
            return `P${(-v*(180/Math.PI)).toFixed(0)}`;
        } else {
            return `S${(v*(180/Math.PI)).toFixed(0)}`;
        }
    }
    static speed(v) {
        if ( v == undefined ) {
            return "-.-";
        }
        return (v*1.9438452).toFixed(1);
    }
}


class NMEALayout extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.store = props.bgPage.getStore();

    }
    render() {
        return (
            <div>
            <TextBox field="awa" units="deg"  store={this.store} display={DisplayConverters.relativeAngle} />
            <TextBox field="aws" units="kn" store={this.store} display={DisplayConverters.speed} />
            <TextBox field="twa" units="deg" store={this.store} display={DisplayConverters.relativeAngle} />
            <TextBox field="tws" units="kn" store={this.store} display={DisplayConverters.speed} />
            <TextBox />
            <TextBox />
            <NMEAControls bgPage={this.props.bgPage} />
            </div>
        );

    }

}

class NMEAControls extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }
    render() {
        return (
            <div className="controls">
                <PortControl bgPage={this.props.bgPage}  />
            </div>
        );
    }
}



class TextBox extends React.Component {
    constructor(props) {
        super(props);
        this.store = props.store;
        this.field = props.field;
        this.displayFn = props.display;
        this.state = {
            tl : props.tl || "",
            tr : props.tr || "",
            bl : props.bl || props.field || "",
            br : props.br || props.units || "",
            main: props.main || "-.-"
        }
        this.updateRate = props.updateRate || 1000;
    }

    componentDidMount() {
        this.updateInterval = setInterval((() => {
            if ( this.store ) {
                const display = this.displayFn(this.store.state[this.field]);
                if ( display != this.state.main ) {
                    this.setState({main: display});
                }
                if (this.store.history[this.field]) {
                    //console.log(this.field, this.store.history[this.field]);
                }
            }
        }).bind(this), this.updateRate);

    }
    
    componentWillUnmount() {
        if ( this.updateInterval ) {
            cancelIntervale(this.updateInterval);
        }
    }


    /*
                  <svg className="overlay">
                    <path d="M 50 50 C 20 20, 40 20, 50 10 A 30 50 0 0 1 162.55 162.45" stroke="green" stroke-width="4"  />
                  <circle cx="100" cy="100" r="20" fill="red"/>
              </svg>
    */

    render() {
        return (
            <div className="textbox" >
              <div className="overlay main">{this.state.main}</div>
              <div className="corner tl">{this.state.tl}</div>
              <div className="corner tr">{this.state.tr}</div>
              <div className="corner bl">{this.state.bl}</div>
              <div className="corner br">{this.state.br}</div>
            </div>
            );
    }
}




export { NMEALayout };