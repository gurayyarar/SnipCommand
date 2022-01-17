import React from 'react';
import {connect} from 'react-redux';

import { MainMenus, SearchResult } from "../../core/Constants";

import Icon from '@mdi/react';
import { mdiTagTextOutline, mdiSelectSearch, mdiPlus } from "../../core/Icons";

import { ReduxHelpers } from "../../core/Helpers";
import SnippetCrudModal from '../SnippetCrudModal';

import {SET_SEARCH_QUERY} from "../../redux/actions/searchActions";

import './style.scss';

class Sidebar extends React.Component {
    state = {
        snippetModalVisible: false
    }

    componentDidMount() {
        this.props.setTags();
        this.setSelectedMenu(MainMenus[0], 'menu');
    }

    setSelectedMenu = (item, type) => {
        const {setSelectedMenu, setCommandList, setQuery} = this.props;
        const selectedMenu = type === 'tag' ? {slug: item, name: item, icon: 'hashtag', type} : {...item, type};

        setSelectedMenu(selectedMenu);
        setCommandList(selectedMenu);
        setQuery("");
    }

    render() {
        const {tags, selectedMenu, query} = this.props;
        const {snippetModalVisible} = this.state;

        return (
            <nav className="comp_sidebar">
                <SnippetCrudModal show={snippetModalVisible}
                    onClose={() => this.setState({snippetModalVisible: false})}/>

                {/* Nav Menus */}
                <div className="header">
                    {/* Add New */}
                    <div onClick={() => this.setState({snippetModalVisible: true})} className="new-snippet-container">
                        <div className="text">
                            New Command Snippet
                        </div>

                        <div className="plus">
                            <Icon path={mdiPlus} size="20px"/>
                        </div>
                    </div>

                    {/* Search Result */}
                    {
                        query !== ''
                            ? (
                                <div className="search-result-container">
                                    <ul className="menu-list">
                                        <li className={`menu-list-item ${selectedMenu.slug === SearchResult.slug ? 'active' : ""}`}>
                                            <div className="icon-container">
                                                <Icon path={mdiSelectSearch} size="20px"/>
                                            </div>
                                            <div className="others-container">
                                                <div className="text-container">{SearchResult.name}</div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            )
                            : null
                    }

                    {/* Sidebar Menus */}
                    <div className="main-menu-container">
                        <ul className="menu-list">
                            {
                                MainMenus.map((value, index) => {
                                    let containerClassName = 'menu-list-item';

                                    if (value.slug === selectedMenu.slug) containerClassName += ' active';

                                    return (
                                        <li key={index} onClick={() => this.setSelectedMenu(value, 'menu')} className={containerClassName}>
                                            <div className="icon-container">
                                                <Icon path={value.icon} size="20px"/>
                                            </div>

                                            <div className="others-container">
                                                <div className="text-container">
                                                    {value.name}
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>

                    <div className="sidebar-title">
                        TAGS
                    </div>
                </div>
                
                <div className="body">
                    {
                        tags.length === 0
                            ? <div className="no-item-text">
                                There isn't any tag yet.
                            </div>
                            : (
                                <ul className="menu-list">
                                    {
                                        tags.map((value, index) => {
                                            let containerClassName = 'menu-list-item';
                                            if (value === selectedMenu.slug) containerClassName += ' active';

                                            return (
                                                <li key={index} onClick={() => this.setSelectedMenu(value, 'tag')}
                                                    className={containerClassName}>
                                                    <div className="icon-container">
                                                        <Icon path={mdiTagTextOutline} size="15px"/>
                                                    </div>

                                                    <div className="others-container">
                                                        <div className="text-container">{value}</div>
                                                    </div>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            )
                    }
                </div>
            </nav>
        )
    }
}

const mapStateToProps = state => {
    const {tags, selectedMenu} = state.sidebar;
    const {query} = state.search;
    return {tags, selectedMenu, query};
};

const mapDispatchToProps = (dispatch) => {
    return {
        setSelectedMenu: selectedMenu => ReduxHelpers.setSelectedMenu(dispatch, selectedMenu),
        setTags: () => ReduxHelpers.fillTags(dispatch),
        setCommandList: selectedMenu => ReduxHelpers.fillCommands(dispatch, selectedMenu),
        setQuery: query => dispatch({type: SET_SEARCH_QUERY, payload: query})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);