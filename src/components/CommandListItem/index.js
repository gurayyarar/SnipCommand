import React, {Component} from 'react';
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import _ from 'lodash';

import {CommandHelpers, NotyHelpers, ReduxHelpers} from "../../core/Helpers";
import SnippetCrudModal from "../SnippetCrudModal";
import Api from "../../core/Api";
import {openConfirmDialog} from "../ConfirmDialog";
import SnippetGeneratorModal from "../SnippetGeneratorModal";
import { clipboard } from 'electron';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { paraisoDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import Icon from '@mdi/react';
import {
    mdiCardsHeartOutline,
    mdiCardsHeart,
    mdiDeleteSweepOutline,
    mdiCircleEditOutline,
    mdiDeleteOutline,
    mdiBackupRestore,
    mdiConsoleLine,
} from "../../core/Icons";

import './style.scss';

class CommandListItem extends Component {
    state = {
        showCrudModal: false,
        showGeneratorModal: false,
        confirmDialogTitle: '',
        confirmDialogText: '',
        showConfirmDialog: false,
        timer: null
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

        let tags = item?.tags === '' || item?.tags === null ? [] : item?.tags.split(',');

        if (tags.length > 1) tags = _.sortBy(tags);

        return tags;
    }

    /**
     * Show item details when double click
     */
    showItemDetails = () => {
        this.setState({
            timer: clearTimeout(this.state.timer),
        });

        this.setState({showGeneratorModal: true});
    }

    /**
     * Copy command to clipboard single click
     */
    copyCommand = (e) => {
        if (e.detail === 1) {
            this.setState({
                timer: setTimeout(() => {
                    const willCopyVal = CommandHelpers.replacedCommand(this.props.item.command);

                    clipboard.writeText(willCopyVal);

                    NotyHelpers.open('The command copied your clipboard!', 'info', 3000);
                }, 200)
            });
        }
    }

    render() {
        const { item, selectedMenu} = this.props;
        const { showCrudModal, showGeneratorModal } = this.state;
        const commandHtml = CommandHelpers.commandAsHtml(item?.command);
        const tags = this.getTags();

        return (
            <div className="comp_command-list-item">
                <SnippetCrudModal id={item?.id} show={showCrudModal}
                    onClose={() => this.setState({showCrudModal: false})}/>

                <SnippetGeneratorModal item={item} show={showGeneratorModal}
                    onClose={() => this.setState({showGeneratorModal: false})}/>

                {/* List Items */}
                <div className="sub-container" 
                    onClick={this.copyCommand} onDoubleClick={this.showItemDetails}
                    title='One click: copy, Double click: open details'>
                    <div className="left-side">
                        <div className="title">
                            <Icon path={mdiConsoleLine} size="15px"/>

                            <span>
                                {item?.title}
                            </span>
                        </div>

                        {/* Command Block */}
                        <div className='code'>
                            <SyntaxHighlighter language="dsconfig" style={paraisoDark}>
                                {commandHtml && commandHtml.length > 300 ? commandHtml.substring(0, 300) + '...' : commandHtml}
                            </SyntaxHighlighter>
                        </div>

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
                </div>

                {/* Item Hover Options */}
                {
                    selectedMenu?.slug === 'trash'
                        ? (
                            // Trash Item Options
                            <ul className="command-list-menu">
                                <li className="restore" title="Restore" onClick={() => this.restoreFromTrash(item)}>
                                    <Icon path={mdiBackupRestore} size="20px"/>
                                </li>

                                <li onClick={() => this.onClickRemovePermanently(item?.id)} className="trash"
                                    title="Delete Permanently">
                                    <Icon path={mdiDeleteSweepOutline} size="20px"/>
                                </li>
                            </ul>
                        )
                        : (
                            // Regular Item Options
                            <ul className="command-list-menu">
                                <li className={`favourite-${item?.isFavourite}`} onClick={this.toggleFavourite} title="Favourite / Unfavourite">
                                    {
                                        item?.isFavourite
                                            ? <Icon path={mdiCardsHeart} size="20px"/>
                                            : <Icon path={mdiCardsHeartOutline} size="20px"/>
                                    }
                                </li>

                                <li className="edit" title="Edit" onClick={() => this.setState({showCrudModal: true})}>
                                    <Icon path={mdiCircleEditOutline} size="20px"/>
                                </li>

                                <li onClick={() => this.onClickMoveOnTrash(item)} className="trash" title="Move To Trash">
                                    <Icon path={mdiDeleteOutline} size="20px"/>
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