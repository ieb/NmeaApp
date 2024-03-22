import React from 'react';
import PropTypes from 'prop-types';
import { LazyLog } from 'react-lazylog';
import yaml  from 'js-yaml';

import './styles/logs.css';


class StoreView  extends React.Component {
    static propTypes = {
        storeAPI: PropTypes.object,
        title: PropTypes.string,
        enableFeed: PropTypes.func,
    };
    constructor(props) {
        super(props);
        this.props = props;
        this.title = "Store";
        this.storeAPI = props.storeAPI;
        this.store = {};
        this.state = {
            linecount: 0,
            renderedStore: "",
            pauseButton: "Pause"
        };
        this.pauseUpdates = this.pauseUpdates.bind(this);
        this.storeAPI.onStateChange((storeUpdate) => {
            for(let k in storeUpdate) {
                this.store[k] = storeUpdate[k];
            }
            this.setState({renderedStore: yaml.dump(this.store, {
                    skipInvalid: true,
                    flowLevel:1,
                })});
        });        
    }
    componentDidMount() {
        console.log("Register window for events");
        this.storeAPI.addListener();
        window.addEventListener('beforeunload', this.storeAPI.removeListener, false);
    }
    
    componentWillUnmount() {
        console.log("deRegister window for events");
        window.removeEventListener('beforeunload', this.storeAPI.removeListener, false);
        this.storeAPI.removeListener();
    }
    pauseUpdates() {
        if ( this.state.pauseButton === "Pause" ) {
            this.setState({pauseButton: 'Resume', pausedLogs: this.state.renderedStore});
        } else {
            this.setState({pauseButton: 'Pause', pausedLogs: undefined});
        }
    }


    render() {
        let text= this.state.pausedLogs || this.state.renderedStore;
        if ( text === "" ) {
            text = "Waiting for updates...."
        }
        return (
            <div className="logviewer" >
            <div>{this.title}<button onClick={this.pauseUpdates} >{this.state.pauseButton}</button></div>
            <div>NMEA2000 Standard units, Rad, m/s, K, etc</div>
            <LazyLog text={text} extraLines={1} 
                selectableLines 
                caseInsensitive
                follow
                lineClassName="logline"
                enableSearch / >
            </div> 

        );
    }
}

export { StoreView };