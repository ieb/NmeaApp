import React from 'react';


class EditUIControl extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.onAddItem = props.onAddItem;
        this.onSave = props.onSave;
        this.doEdit = this.doEdit.bind(this);
        this.state = {
            editing: false
        };
    }

    doEdit(e) {
        const editing = !this.state.editing;
        this.props.onEdit(editing);
        this.setState({ editing });
    }

    render() {
        if ( this.state.editing ) {
        return ( 
            <div className="uiControls">
                <div className="controls">
                    <button onClick={this.doEdit} title="finish edit page">{"\u2705"}</button>
                    <button onClick={this.onAddItem} title="add box" value="addbox" >{"\uFF0B"}</button>
                </div>
            </div>
            );

        } else {
        return (
            <div className="uiControls">
                <div className="controls"> 
                    <button onClick={this.doEdit} title="edit page" >{"\u270D"}</button>
                    <button onClick={this.onAddItem} title="add page" value="addpage" >{"\uFF0B"}</button>
                    <button onClick={this.onAddItem} title="delete page" value="deletepage" >-</button>
                </div>
                <div className="controls"> 
                    <button onClick={this.onSave} title="save layout">&#x1f4be;</button>
                </div>
            </div>
            );

        }
    }

};


export { EditUIControl };