import React from "react";
import {connect} from "react-redux";

import ContentHeader from "../ContentHeader";
import CommandList from "../CommandList";

import './style.scss';


class CommandArea extends React.Component {
    render() {
        const {selectedMenu, commands} = this.props;

        return (
            <>
                <ContentHeader title={selectedMenu?.name} itemLength={commands.length} icon={selectedMenu?.icon}/>

                <div className="command-list">
                    <CommandList items={commands}/>
                </div>
            </>
        )
    }
}

const mapStateToProps = state => {
    const {selectedMenu} = state.sidebar;
    const {commands} = state.command;
    return {selectedMenu, commands};
};

export default connect(mapStateToProps)(CommandArea);