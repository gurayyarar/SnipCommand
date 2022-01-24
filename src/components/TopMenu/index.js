import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { remote, ipcRenderer } from "electron";
import { connect } from "react-redux";

import { SearchField } from "../FormElements";
import { ReduxHelpers } from "../../core/Helpers";
import { SET_SEARCH_QUERY } from "../../redux/actions/searchActions";
import { MainMenus, SearchResult } from "../../core/Constants";
import SettingsModal from "../SettingsModal";

import Icon from '@mdi/react';
import {
    mdiWindowClose,
    mdiMinus,
    mdiFileTableBoxMultipleOutline,
    mdiMinusBoxMultipleOutline,
    mdiCogOutline,
} from "../../core/Icons";

import './style.scss';


class TopMenu extends Component {
    state = {
        maximize: false,
        showSettingsModal: false,
        settingsSelectedTab: 'storage',
        isWindows: process.platform === 'win32'
    }

    componentDidMount() {
        const { isWindows } = this.state;

        ipcRenderer.on('appMenu', (event, args) => {
            if (args.type === 'preferences') {
                this.setState({ showSettingsModal: true, settingsSelectedTab: args.tab });
            }
        })

        if (isWindows) {
            this.onResizeWindow();
            this.refMenu.addEventListener('click', this.onClickMenu);
            this.refClose.addEventListener('click', this.onClickClose);
            this.refMinimize.addEventListener('click', this.onClickMinimize);
            this.refMaximize.addEventListener('click', this.onClickMaximize);

            window.addEventListener('resize', this.onResizeWindow);
        }
    }

    componentWillUnmount() {
        const { isWindows } = this.state;

        if (isWindows) {
            this.refMenu.removeEventListener('click', this.onClickMenu);
            this.refClose.removeEventListener('click', this.onClickClose);
            this.refMinimize.removeEventListener('click', this.onClickMinimize);
            this.refMaximize.removeEventListener('click', this.onClickMaximize);

            window.removeEventListener('resize', this.onResizeWindow);
        }
    }

    onClickClose = () => remote.getCurrentWindow().close();
    onClickMenu = async e => await ipcRenderer.invoke('display-app-menu', { x: e.x, y: e.y });
    onClickMinimize = () => remote.getCurrentWindow().minimizable ? remote.getCurrentWindow().minimize() : null;
    onClickMaximize = () => remote.getCurrentWindow().isMaximized() ? remote.getCurrentWindow().unmaximize() : remote.getCurrentWindow().maximize();
    onResizeWindow = () => this.setState({ maximize: remote.getCurrentWindow().isMaximized() });

    onChangeText = (text) => {
        const { setQuery, setSelectedMenu, setCommandList } = this.props;
        const selectedMenu = text === "" ? MainMenus[0] : SearchResult;

        setQuery(text);
        setSelectedMenu(selectedMenu);
        setCommandList(selectedMenu, text);
    }

    render() {
        const { maximize, showSettingsModal, isWindows, settingsSelectedTab } = this.state;
        const { query } = this.props;

        return (
            <div className="topmenu">
                <SettingsModal show={showSettingsModal} selectedTab={settingsSelectedTab}
                    onClose={() => this.setState({ showSettingsModal: false })}
                    tabChanged={settingsSelectedTab => this.setState({ settingsSelectedTab })}/>

                {/* Hamburger Menu */}
                <div className="left-side">
                    {
                        isWindows
                            ? (
                                <button ref={ref => this.refMenu = ref} className="btn-menubar menu" type="button">
                                    <span />
                                    <span />
                                    <span />
                                </button>
                            )
                            : null
                    }
                </div>

                {/* Search */}
                <div className="center-side">
                    <SearchField placeholder="Search command" value={query}
                        onChangeText={text => this.onChangeText(text)}
                        onClearClick={() => this.onChangeText("")}
                        spellCheck={false}/>
                </div>

                {/* Top Buttons */}
                <div className="right-side">
                    {/* Settings Button */}
                    <button className="btn-preferences" title="Preferences"
                        onClick={() => this.setState({ showSettingsModal: true, settingsSelectedTab: 'storage' })}>
                        <Icon path={mdiCogOutline} size="22px"/>
                    </button>

                    {/* Window Buttons */}
                    {
                        isWindows
                            ? (
                                <div className="command-buttons">
                                    <button ref={ref => this.refMinimize = ref} className="btn-menubar minimize">
                                        <Icon path={mdiMinus} size="20px"/>
                                    </button>
                                    <button ref={ref => this.refMaximize = ref} className="btn-menubar maximize">
                                        {
                                            maximize ? <Icon path={mdiMinusBoxMultipleOutline} size="16px"/> :
                                                <Icon path={mdiFileTableBoxMultipleOutline} rotate={180} size="16px"/>
                                        }
                                    </button>
                                    <button ref={ref => this.refClose = ref} className="btn-menubar close">
                                        <Icon path={mdiWindowClose} size="20px"/>
                                    </button>
                                </div>
                            )
                            : null
                    }
                </div>
            </div>
        )
    }
}

TopMenu.defaultProps = {
    onClickSettings: PropTypes.func
}

const mapStateToProps = state => {
    const { query } = state.search;

    return { query };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setSelectedMenu: selectedMenu => ReduxHelpers.setSelectedMenu(dispatch, selectedMenu),
        setQuery: (query) => dispatch({ type: SET_SEARCH_QUERY, payload: query }),
        setCommandList: (selectedMenu, query) => ReduxHelpers.fillCommands(dispatch, selectedMenu, query)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TopMenu);