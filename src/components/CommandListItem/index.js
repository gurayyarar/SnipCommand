import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import _ from 'lodash';
import {clipboard} from 'electron';

import {CommandHelpers, NotyHelpers, ReduxHelpers, StorageHelpers} from "../../core/Helpers";
import SvgIcon from "../SvgIcon";
import SnippetCrudModal from "../SnippetCrudModal";
import Api from "../../core/Api";
import {openConfirmDialog} from "../ConfirmDialog";
import SnippetGeneratorModal from "../SnippetGeneratorModal";

import './style.scss';


class CommandListItem extends Component {
    state = {
        showCrudModal: false,
        showGeneratorModal: false,
        confirmDialogTitle: "",
        confirmDialogText: "",
        showConfirmDialog: false
    }
    onClickAction = () => {
        const {item} = this.props;
        const {formValues} = this.state;
        let onClickAction = StorageHelpers.preference.get('onClickAction');
        let autoClose = StorageHelpers.preference.get('autoClose');

        if(item.command.match(new RegExp(`\\[s\\s*(.*?)\\s*\\/]`, 'g'))) {
            onClickAction = 'open';
        }

        if(onClickAction === 'copy') {
            const willCopyVal = CommandHelpers.replacedCommand(item.command, formValues);
            clipboard.writeText(willCopyVal);
            NotyHelpers.open('The command copied your clipboard!', 'info', 3000);
    
            if(autoClose === true) {
                const { remote } = require('electron')
                remote.BrowserWindow.getFocusedWindow().minimize();
            }
        } else {
            this.setState({showGeneratorModal: true});
        }
    }

    toggleFavourite = () => {
        const {item, selectedMenu, setCommandList} = this.props;
        let updatedItem = item;
        updatedItem.isFavourite = !updatedItem.isFavourite;
        new Api().updateCommandItem(updatedItem);

        setCommandList(selectedMenu);
    }

    onClickMoveOnTrash = item => {
        const {selectedMenu, setCommandList, setTags} = this.props;

        openConfirmDialog({
            title: 'Confirmation',
            text: 'Are you sure want to move to the trash?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        item.isTrash = true;
                        new Api().updateCommandItem(item);
                        setCommandList(selectedMenu);
                        setTags();
                        NotyHelpers.open('This item has been moved to trash!', 'error', 2000);
                    },
                    className: 'btn btn-danger'
                },
                {
                    label: 'No',
                    onClick: () => null,
                    className: 'btn btn-default'
                }
            ]
        });
    }

    onClickRemovePermanently = id => {
        const {selectedMenu, setCommandList, setTags} = this.props;

        openConfirmDialog({
            title: 'Confirmation',
            text: 'Are you sure want to delete permanently?<p><small><b>This process can not be undone!</b></small></p>',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        new Api().deleteCommandById(id);
                        setCommandList(selectedMenu);
                        setTags();
                        NotyHelpers.open('This item has been deleted permanently!', 'success', 2500);
                    },
                    className: 'btn btn-danger'
                },
                {
                    label: 'No',
                    onClick: () => null,
                    className: 'btn btn-default'
                }
            ]
        });
    }

    restoreFromTrash = item => {
        const {selectedMenu, setCommandList, setTags} = this.props;
        item.isTrash = false;
        new Api().updateCommandItem(item);
        setCommandList(selectedMenu);
        setTags();
        NotyHelpers.open('This item has been restored from trash!', 'success', 2000);
    }

    getTags = () => {
        const {item} = this.props;
        let tags = item?.tags === "" || item?.tags === null ? [] : item?.tags.split(',');

        if (tags.length > 1) tags = _.sortBy(tags);

        return tags;
    }

    render() {
        const {item, selectedMenu} = this.props;
        const {showCrudModal, showGeneratorModal} = this.state;
        const commandHtml = CommandHelpers.commandAsHtml(item?.command);
        const tags = this.getTags();

        return (
            <div className="comp_command-list-item">
                <SnippetCrudModal
                    id={item?.id}
                    show={showCrudModal}
                    onClose={() => this.setState({showCrudModal: false})}
                />

                <SnippetGeneratorModal
                    item={item}
                    show={showGeneratorModal}
                    onClose={() => this.setState({showGeneratorModal: false})}
                />

                <div onClick={this.onClickAction} className="sub-container">
                    <div className="left-side">
                        <div className="title">{item?.title}</div>
                        <div className="code" dangerouslySetInnerHTML={{__html: commandHtml}}/>

                        <ul className="tags-list">
                            {
                                tags.map((value, index) => {
                                    return (
                                        <li key={index}>#{value}</li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                    <div className="right-side">
                        {
                            selectedMenu?.slug !== 'trash' && item?.isFavourite
                                ? <SvgIcon name="star"/>
                                : null
                        }
                    </div>
                </div>

                {
                    selectedMenu?.slug === 'trash'
                        ? (
                            <ul className="command-list-menu">
                                <li onClick={() => this.onClickRemovePermanently(item?.id)} className="trash"
                                    title="Delete Permanently">
                                    <SvgIcon name="trash"/>
                                </li>
                                <li className="restore" title="Restore" onClick={() => this.restoreFromTrash(item)}>
                                    <SvgIcon name="restore"/>
                                </li>
                            </ul>
                        )
                        : (
                            <ul className="command-list-menu">
                                <li
                                    className={`favourite-${item?.isFavourite}`}
                                    onClick={this.toggleFavourite}
                                    title="Favourite / Unfavourite"
                                >
                                    {
                                        item?.isFavourite
                                            ? <SvgIcon name="star"/>
                                            : <SvgIcon name="star_outline"/>
                                    }
                                </li>
                                <li className="edit" title="Edit" onClick={() => this.setState({showCrudModal: true})}>
                                    <SvgIcon name="edit"/>
                                </li>
                                <li onClick={() => this.onClickMoveOnTrash(item)} className="trash" title="Move To Trash">
                                    <SvgIcon name="trash"/>
                                </li>
                            </ul>
                        )
                }
            </div>
        )
    }
}

CommandListItem.propTypes = {
    item: PropTypes.object
}

const mapStateToProps = state => {
    const {selectedMenu} = state.sidebar;
    return {selectedMenu};
};

const mapDispatchToProps = (dispatch) => {
    return {
        setTags: () => ReduxHelpers.fillTags(dispatch),
        setCommandList: selectedMenu => ReduxHelpers.fillCommands(dispatch, selectedMenu)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommandListItem);