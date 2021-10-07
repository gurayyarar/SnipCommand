import React from 'react';
import PropTypes from 'prop-types';
import MarkdownIt from 'markdown-it';
import Generate from 'generate-password';
import _ from 'lodash';
import {clipboard} from 'electron';

import Modal from '../Modal';
import {TextField, Button} from "../FormElements";
import {CommandHelpers, NotyHelpers, StorageHelpers} from "../../core/Helpers";
import ChoiceField from "../FormElements/ChoiceField";
import PasswordGeneratorField from "../FormElements/PasswordGeneratorField";

import './style.scss';


class SnippetGeneratorModal extends React.Component {
    mdParser = new MarkdownIt();
    state = {
        formValues: {},
        formElements: []
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {show, item} = this.props;

        if (show && prevProps.show !== show) {
            const commandParams = CommandHelpers.organizeCommands(item?.command);
            let formValues = {};
            _.forEach(commandParams, (value) => {
                let val = value.value;

                if (value.type === 'password') {
                    val = this.generatePassword(value.value);
                } else if (value.type === 'choice') {
                    val = value.value.split(',')[0];
                }

                formValues[value.id] = val;
            });

            this.setState({formValues, formElements: commandParams});
        }
    }

    generatePassword = length => {
        return Generate.generate({
            length: parseInt(length || 6),
            numbers: true
        })
    }

    onClose = () => {
        const {onClose} = this.props;
        this.setState({formValues: {}});
        onClose && onClose();
    }

    copyCommand = () => {
        const {item} = this.props;
        const {formValues} = this.state;
        let autoClose = StorageHelpers.preference.get('autoClose');
        const willCopyVal = CommandHelpers.replacedCommand(item?.command, formValues);

        clipboard.writeText(willCopyVal);
        NotyHelpers.open('The command copied your clipboard!', 'info', 3000);
        this.onClose();

        if(autoClose === true) {
            const { remote } = require('electron')
            remote.BrowserWindow.getFocusedWindow().minimize();
        }
    }

    _footer = () => {
        return (
            <div className="button-container">
                <div className="btn-cancel-container">
                    <Button styleType="default" text="Close" onClick={this.onClose}/>
                </div>
                <div className="btn-save-container">
                    <Button styleType="success" onClick={this.copyCommand} text="Copy Command"/>
                </div>
            </div>
        )
    }

    _command = item => {
        const {formValues} = this.state;
        let result = "";

        if (item.type === 'variable') {
            result = (
                <TextField
                    name={item.id}
                    label={item.name}
                    value={formValues[item.id]}
                    onChangeText={value => {
                        const lastVal = formValues;
                        lastVal[item.id] = value;
                        this.setState({formValues: lastVal});
                    }}
                />
            )
        } else if (item.type === 'choice') {
            result = (
                <ChoiceField
                    name={item.id}
                    label={item.name}
                    items={item.value.split(',')}
                    value={item.value.split(',')[0]}
                    onChangeText={value => {
                        const lastVal = formValues;
                        lastVal[item.id] = value;
                        this.setState({formValues: lastVal});
                    }}
                />
            )
        } else if (item.type === 'password') {
            result = (
                <PasswordGeneratorField
                    name={item.id}
                    label={`${item.name} (Length: ${item.value})`}
                    value={formValues[item.id]}
                    onChangeText={() => {
                        const lastVal = formValues;
                        lastVal[item.id] = this.generatePassword(item.value);
                        this.setState({formValues: lastVal});
                    }}
                />
            )
        }

        return result;
    }

    render() {
        const {formElements} = this.state;
        const {show, item} = this.props;
        const tags = item.tags === "" || item.tags === null ? [] : item.tags.split(',');
        const commandHtml = CommandHelpers.commandAsHtml(item?.command);

        return (
            <div className="comp_snippet-generator-modal">
                <Modal
                    show={show}
                    onClose={this.onClose}
                    title={item?.title}
                    footerTemplate={this._footer}
                >
                    <div className="h-separator command-container">
                        <div className="title">Command</div>
                        <div className="code" dangerouslySetInnerHTML={{__html: commandHtml}}/>
                    </div>
                    {
                        tags.length > 0
                            ? (
                                <div className="h-separator tags-container">
                                    <div className="title">Tags</div>
                                    <ul>
                                        {
                                            tags.map((value, index) => {
                                                return <li key={`tag_${index}`}>#{value}</li>
                                            })
                                        }
                                    </ul>
                                </div>
                            )
                            : null
                    }
                    {
                        formElements.length > 0
                            ? (
                                <div className="h-separator command-params-container">
                                    <div className="title">Command Params</div>
                                    {
                                        formElements.map((val, index) => {
                                            return (
                                                <div
                                                    className={formElements.length === index + 1 ? 'last-fe-container' : ""}
                                                    key={`command_params_${index}`}
                                                >{this._command(val)}</div>
                                            );
                                        })
                                    }
                                </div>
                            )
                            : null

                    }
                    {
                        item.description !== undefined && item.description !== "" && item.description !== null
                            ? (
                                <div className="h-separator description-container">
                                    <div className="title">Description</div>
                                    <div className="description-text"
                                         dangerouslySetInnerHTML={{__html: this.mdParser.render(item.description)}}
                                    />
                                </div>
                            )
                            : null
                    }
                </Modal>
            </div>
        )
    }
}

SnippetGeneratorModal.propTypes = {
    show: PropTypes.bool,
    item: PropTypes.object
}

export default SnippetGeneratorModal;