import React from 'react';
import { PortControl } from './portcontrol.jsx';
import { EditUIControl } from './uicontrol.jsx';
import {DataTypes, DisplayUtils } from './datatypes.js';




class NMEALayout extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.storeAPI = props.storeAPI;
        this.onEditLayout = this.onEditLayout.bind(this);
        this.onAddItem = this.onAddItem.bind(this);
        this.onChangeItem = this.onChangeItem.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onMenuChange = this.onMenuChange.bind(this);
        this.onPageChange = this.onPageChange.bind(this);
        this.lastPacketsRecived  = 0;
        this.state = {
            editing: false,
            dataIndicatorOn: false,
            layout: this.loadLayout() 
        };
    }

    loadLayout() {
        let layout = localStorage.getItem('layout');
        if (layout) {
            const l = JSON.parse(layout);
            if (l.pageId !== undefined && l.pages !== undefined ) {
                return layout;
            }
        }
        const start = Date.now();
        return JSON.stringify({
                pageId: 1,
                pages: [
                    {id: 1, name: 'Home',
                        boxes: [
                            { id: start, field:"awa"},
                            { id: start+1, field:"aws"},
                            { id: start+2, field:"twa"},
                            { id: start+3, field:"tws"},
                        ]}
                ]
            });
    }



    getLayout() {
        const layout = JSON.parse(this.state.layout);
        const page = layout.pages.find((p) => p.id === layout.pageId);
        return {
            layout,
            page
        };
    }
    setLayout(l) {
        this.setState({layout: JSON.stringify(l.layout)});
    }

    onEditLayout( editing ) {
        this.setState({editing});
    }
    onAddItem(e) {
        console.log("Add Item ", e.target.value);
        if ( e.target.value == "addbox" ) {
            const l = this.getLayout();
            l.page.boxes.push({id: Date.now(), field:"awa"});
            this.setLayout(l);
        } else if ( e.target.value == "addpage" ) {
            const l = this.getLayout();
            const id = Date.now();
            l.layout.pages.push({id: id, name: 'New page',
                        boxes: [
                            { id: id, field:"awa"},
                            { id: id+1, field:"aws"},
                            { id: id+2, field:"twa"},
                            { id: id+3, field:"tws"},
                        ]});
            l.layout.pageId = id;
            this.setLayout(l);
        } else if ( e.target.value == "deletepage") {
            const l = this.getLayout();
            const toRemove = l.layout.pageId;
            l.layout.pageId = undefined;
            let removed = false;
            l.layout.pages = l.layout.pages.filter((p) => {
                 if ( p.id != toRemove ) {
                    if ( !removed ) {
                        l.layout.pageId = p.id;
                    }
                    return true;
                 } else {
                    removed = true;
                    return false;
                 }
            });
            if ( l.layout.pageId === undefined && l.layout.pages.length > 0 ) {
                l.layout.pageId = l.layout.pages[0].id;
            }
            this.setLayout(l);
        }

    }


    onChangeItem(event, id, field) {
        if ( event === "remove") {
            const l = this.getLayout();
            const newBoxes = l.page.boxes.filter((b) => b.id !== id);
            l.page.boxes = newBoxes;
            this.setLayout(l);
        } else if (event === "update") {
            const l = this.getLayout();

            const newBoxes = [];
            console.log("update ",id, field, this.state.boxes);
            const box = l.page.boxes.find((b) => b.id === id);
            box.id = Date.now();
            box.field = field;
            this.setLayout(l);
        }

    }
    onSave() {
        localStorage.setItem('layout', this.state.layout);
    }

    onMenuChange(e) {
        this.setState({ showMenu: !this.state.showMenu });

    }

    onPageChange(e) {
        const l = this.getLayout();
        l.layout.pageId = +e.target.value;
        this.setLayout(l);
    }
    onPageNameChange(e, pageId) {
        const l = this.getLayout();
        l.page.name = e.target.value;
        this.setLayout(l);        
    }

    renderMenu(l) {
        const menuClass = this.state.showMenu?"menu normal":"menu minimised";
        return (
            <div className={menuClass} >
                <MenuButton mainAPI={this.props.mainAPI} onClick={this.onMenuChange} />
                <PortControl mainAPI={this.props.mainAPI} />
                {l.layout.pages.map((page) => {
                    const className= (page.id == l.layout.pageId)?"pageButton activePage":"pageButton";
                    if (page.id == l.layout.pageId && this.state.editing) {
                        return (<input key={page.id} 
                                type="text" 
                                className={className} 
                                onChange={(e) => {
                                    this.onPageNameChange(e, page.id);
                                }} 
                                value={page.name} />
                        )
                    } else {
                        return (
                            <button key={page.id} 
                                className={className} 
                                onClick={this.onPageChange} 
                                value={page.id} >{page.name}</button>
                        )
                    }
                })}
                <EditUIControl onEdit={this.onEditLayout} 
                    onSave={this.onSave}
                    onAddItem={this.onAddItem}/>
            </div>
        );
    }
    render() {
        const l = this.getLayout();
        console.log("Layout ", l);
        return (
            <div className="nmeaLayout">
                {this.renderMenu(l)}
                <div>
                 {l.page.boxes.map((item) => <TextBox field={item.field} id={item.id} key={item.id} onChange={this.onChangeItem} editing={this.state.editing}  storeAPI={this.storeAPI} />)}
                </div>
            </div>
        );

    }

}

class MenuButton extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.lastPacketsRecived = 0;
        this.state = {
            dataIndicatorOn: false
        };
    }

    componentDidMount() {
        this.updateInterval = setInterval((async () => {
            const packetsRecieved = await this.props.mainAPI.getPacketsRecieved();
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

    render() {
        const indicatorClass = this.state.dataIndicatorOn?"iOn":"iOff";
        return (<button onClick={this.props.onClick} className={indicatorClass} >{"\u2630"}</button>)
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
                <PortControl mainAPI={this.props.mainAPI}  />
            </div>
        );
    }
}



class TextBox extends React.Component {
    constructor(props) {
        super(props);
        this.storeAPI = props.storeAPI;
        this.editing = props.editing;
        this.onChange = props.onChange;
        this.id = props.id;
        this.field = props.field;
        this.theme = props.theme || "default";
        this.themes = [
            "default",
            "red",
            "green",
            "blue",
            "yellow"
        ];
        this.debugEnable = false;
        this.state = {
            main: props.main || "-.-",
            options: [],
            graph: {
                path: "M 0 0",
                outline: "M 0 0"
            }
        }
        this.updateDisplayState = this.updateDisplayState.bind(this);
        this.changeField = this.changeField.bind(this);
        this.changeTheme = this.changeTheme.bind(this);
        this.remove = this.remove.bind(this);
        this.onDebug = this.onDebug.bind(this);
        this.updateRate = props.updateRate || 1000;
    }

    componentDidMount() {
        this.updateDisplayState().then(() => {
            this.updateInterval = setInterval(this.updateDisplayState, this.updateRate);
        });

    }
    
    componentWillUnmount() {
        if ( this.updateInterval ) {
            clearInterval(this.updateInterval);
        }
    }


    /*
                  <svg className="overlay">
                    <path d="M 50 50 C 20 20, 40 20, 50 10 A 30 50 0 0 1 162.55 162.45" stroke="green" stroke-width="4"  />
                  <circle cx="100" cy="100" r="20" fill="red"/>
              </svg>
    */

    async updateDisplayState() {
        if ( this.storeAPI ) {
            const dataType = DataTypes.getDataType(this.field);
            const display = dataType.display(await this.storeAPI.getState(this.field));
            const options = await this.storeAPI.getKeys();
            const h = [];
            const v = await this.storeAPI.getHistory(this.field);
            this.debug(this.field, "Values", v);
            if (dataType.withHistory && v &&  v.data.length > 1) {
                h.push(dataType.toDisplayUnits(v.value));
                for (let i = 0; i < v.data.length; i++) {
                    if ( v.data[i] !== undefined && !Number.isNaN(v.data[i])) {
                        h.push(dataType.toDisplayUnits(v.data[i]));
                    }
                }
                const graph = this.generateGraphPath(v, h);
                if ( display != this.state.main || graph.path != this.state.graph.path ) {
                    this.setState({main: display, options: options, graph: graph });
                }
            } else {
                if ( display != this.state.main ) {
                    this.setState({main: display, options: options });
                }
            }
        }        
    }

    horizontalLine(v, range) {
        const y = DisplayUtils.y(v, range).toFixed(0);
        return `M 0 ${y} L 160 ${y}`;
    }


    generateGraphPath(v, h) {
        if ( h && h.length > 1 ) {
            const pairs = [];
            const dataType = DataTypes.getDataType(this.field);
            const range = dataType.range(h);
            if ( range ) {
                for(let i = 0; i < h.length; i++) {
                    const x=DisplayUtils.x(i, range).toFixed(0);
                    const y=DisplayUtils.y(h[i], range).toFixed(0);
                    pairs.push(`${x} ${y}`);
                }
                // add one entry to the start to get a line that starts straight.
                pairs.push(pairs[pairs.length-1]);
                const lastX = DisplayUtils.x(h.length-1, range).toFixed(0);
                const path = `M ${pairs[0]} L ${pairs.join(",")}`; 
                const outline = `M 0 90 L ${pairs.join(",")}, ${lastX} 90 z`; 
                const mean = dataType.toDisplayUnits(v.mean);
                const stdDev = dataType.toDisplayUnits(v.stdev);
                const meanTxt = dataType.toDisplayUnits(v.mean).toFixed(1);
                const stdDevTxt = dataType.toDisplayUnits(v.stdev).toFixed(1);
                const meanLine = this.horizontalLine(mean, range);
                const stdTopLine = this.horizontalLine(mean+stdDev, range);
                const stdBottomLine = this.horizontalLine(mean-stdDev, range);
                if ( path.includes("Infinity") ) {
                    console.log(this.field, "path", path);
                }
                if ( meanLine.includes("Infinity") ) {
                    console.log(this.field, "meanLine", meanLine);
                }
                if ( stdTopLine.includes("Infinity") ) {
                    console.log(this.field, "stdTopLine", stdTopLine);
                }
                if ( outline.includes("Infinity") ) {
                    console.log(this.field, "outline", outline);
                }
                return {
                    path,
                    outline,
                    meanTxt,
                    stdDevTxt,
                    meanLine,
                    stdTopLine,
                    stdBottomLine

                };                           
            } else {
                this.debug(this.field, "no range, no graph");
            }
        } else {
            this.debug(this.field, "no history, no graph");
        }
        return {
            path: "M 0 0",
            outline: "M 0 0",
            meanTxt: "",
            stdDevTxt: "",
            meanLine: "M 0 0",
            stdTopLine: "M 0 0",
            stdBottomLine: "M 0 0"
        };
    }

    changeField(e) {
        this.onChange("update", this.id, e.target.value);
    }
    changeTheme(e) {
        this.onChange("theme", this.id, e.target.value);
    }
    remove(e) {
        this.onChange("remove", this.id);
    }
    debug(...msg) {
        if (this.debugEnable) {
            console.log(msg);
        }
    }
    onDebug(e) {
        this.debugEnable = !this.debugEnable;
    }
    renderEditOverlay() {
        if ( this.props.editing ) {
            const options = this.state.options;
            return (
                <div className="overlay edit">
                <select onChange={this.changeField} value={this.field} title="select data item" >
                    {options.map((item) => <option key={item} value={item} >{item}</option>)}
                </select>
                <select onChange={this.changeTheme} value={this.theme} title="change theme" >
                    {this.themes.map((item) => <option key={item} value={item} >{item}</option>)}
                </select>
                <button onClick={this.remove} title="remove">{"\u2573"}</button>
                <button onClick={this.onDebug} title="debug" >debug</button>
                </div>
                );

        } else {
            return (
                <div></div>
                );
        }
    } 

    render() {
        const dataType = DataTypes.getDataType(this.field);
        return (
            <div className={`textbox ${this.theme}`} >
              <div className="overlay main">{this.state.main}</div>
              <svg className="overlay">
                    <path d={this.state.graph.path} className="path"  />
                    <path d={this.state.graph.outline} className="outline"  />
                    <path d={this.state.graph.meanLine} className="meanline"  />
                    <path d={this.state.graph.stdTopLine} className="stdtopline"  />
                    <path d={this.state.graph.stdBottomLine} className="stdbottomline"  />
                    <text x="5" y="10" className="small">{this.state.graph.meanTxt}</text>
                    <text x="5" y="20" className="small">{this.state.graph.stdDevTxt}</text>
              </svg>
              <div className="corner tl">{dataType.tl}</div>
              <div className="corner tr">{dataType.tr}</div>
              <div className="corner bl">{this.field}</div>
              <div className="corner br">{dataType.units}</div>
              {this.renderEditOverlay()}
            </div>
            );
    }
}




export { NMEALayout };