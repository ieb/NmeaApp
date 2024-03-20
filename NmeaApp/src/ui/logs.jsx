import React from 'react';
import PropTypes from 'prop-types';
import { LazyLog } from 'react-lazylog';
import './styles/logs.css';


class Logs  extends React.Component {
    static propTypes = {
        mainAPI: PropTypes.object
    };
    constructor(props) {
        super(props);
        this.props = props;
        this.mainAPI = props.mainAPI;
        this.state = {
            linecount: 0,
            loglines: [],
            pauseButton: "Pause"
        };
        this.pauseUpdates = this.pauseUpdates.bind(this);

        this.mainAPI.onLogMessage((line) => {
            const loglines = this.state.loglines.slice(-500);
            loglines.push(line);
            this.setState({loglines, linecount: this.state.linecount+1});
        });

    }
    componentDidMount() {
        console.log("Register window for events");
        this.mainAPI.addListener();
        window.addEventListener('beforeunload', this.mainAPI.removeListener, false);
    }
    
    componentWillUnmount() {
        console.log("deRegister window for events");
        window.removeEventListener('beforeunload', this.mainAPI.removeListener, false);
        this.mainAPI.removeListener();
    }
    pauseUpdates() {
        if ( this.state.pauseButton === "Pause" ) {
            this.setState({pauseButton: 'Resume', pausedLogs: this.state.loglines.join('\n')});
        } else {
            this.setState({pauseButton: 'Pause', pausedLogs: undefined});
        }
    }


    render() {
        let text= this.state.pausedLogs || this.state.loglines.join("\n");
        if ( text === "" ) {
            text = "Waiting for logs...."
        }
        return (
            <div className="logviewer" >
            <div>Debug Log <button onClick={this.pauseUpdates} >{this.state.pauseButton}</button></div>
            <LazyLog text={text} extraLines={1} 
                selectableLines 
                caseInsensitive
                follow
                enableSearch />
            </div>
        );
    }


}

export { Logs };