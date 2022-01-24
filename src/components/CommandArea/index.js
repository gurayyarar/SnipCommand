import React from "react";
import {connect} from "react-redux";

import ContentHeader from "../ContentHeader";
import CommandList from "../CommandList";

import './style.scss';


class CommandArea extends React.Component {
    render() {
        const {selectedMenu, commands} = this.props;

        return (
            <div className="comp_command-area">
                <div className="header-container">
                    <ContentHeader title={selectedMenu?.name} itemLength={commands.length} icon={selectedMenu?.icon}/>
                </div>

                <div className="body-container">
                    <CommandList items={commands}/>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    const {selectedMenu} = state.sidebar;
    const {commands} = state.command;
    return {selectedMenu, commands};
};

export default connect(mapStateToProps)(CommandArea);