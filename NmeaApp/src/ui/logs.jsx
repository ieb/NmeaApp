import React from 'react';
import PropTypes from 'prop-types';


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
            loglines: []
        };
        this.mainAPI.onLogMessage((line) => {
            console.log("Log Message", line);
            const loglines = this.state.loglines.slice(0,500);
            loglines.push(JSON.parse(line).join(' '));

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


    render() {
        const lines = [];
        for(let i = 0; i < this.state.loglines.length; i++) {
            const key = this.state.linecount-(this.state.loglines.length-i-1);
            lines.push((<div key={key} >{this.state.loglines[i]}</div>));
        }
        return (
            <div>
                {lines}
            </div>
        );
    }


}

export { Logs };