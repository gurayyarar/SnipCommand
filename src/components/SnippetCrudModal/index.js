import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import {connect} from "react-redux";

import Modal from '../Modal';
import Api from "../../core/Api";
import {TextField, TagsField, MarkdownField, Button, CommandField} from "../FormElements";
import {isTextValid} from "../../core/Utils";
import {ReduxHelpers, TagHelpers} from "../../core/Helpers";

import './style.scss';


class SnippetCrudModal extends React.Component {
    state = {
        formValues: {},
        errorValues: {},
        autoSuggest: []
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {id, show} = this.props;

        if (show && id && prevProps.show !== show) {
            const formValues = new Api().getCommandById(id);
            this.setState({formValues});
        }

        if (show && prevProps.show !== show) {
            const autoSuggest = TagHelpers.getAllItems();
            this.setState({autoSuggest});
        }
    }

    setFormValues = (obj) => {
        const {formValues} = this.state;
        this.setState({formValues: {...formValues, ...obj}});
    }

    onClose = () => {
        const {onClose, setTags, setCommandList, selectedMenu} = this.props;
        this.setState({formValues: {}, errorValues: {}});
        setTags();
        setCommandList(selectedMenu);
        onClose && onClose();
    }

    onSubmit = () => {
        const {formValues} = this.state;
        const {id} = this.props;
        let isFormValid = true;
        let errorValues = {};

        if (!isTextValid(formValues?.title)) {
            errorValues.title = 'This field is required!';
            isFormValid = false;
        }

        if (!isTextValid(formValues?.command)) {
            errorValues.command = 'This field is required!';
            isFormValid = false;
        }

        if (isFormValid) {
            let dataToDb = {...formValues};
            dataToDb.tags = dataToDb.tags || "";
            dataToDb.description = dataToDb.description || "";
            dataToDb.isFavourite = dataToDb.isFavourite || false;
            dataToDb.isTrash = dataToDb.isTrash || false;
            dataToDb.id = id || shortid.generate();

            if (id === undefined) {
                new Api().addNewCommandItem(dataToDb);
            } else {
                new Api().updateCommandItem(dataToDb);
            }

            this.onClose();
        }

        this.setState({errorValues});
    }

    _footer = () => {
        return (
            <div className="button-container">
                <div className="btn-cancel-container">
                    <Button styleType="default" text="Cancel" onClick={this.onClose}/>
                </div>
                <div className="btn-save-container">
                    <Button styleType="success" onClick={this.onSubmit} text="Save Changes"/>
                </div>
            </div>
        )
    }

    render() {
        const {formValues, errorValues, autoSuggest} = this.state;
        const {id, show} = this.props;
        const modalTitle = `${id !== undefined ? 'Edit' : 'New'} - Command Snippet`;

        return (
            <div className="comp_snippet-crud-modal">
                <Modal
                    show={show}
                    onClose={this.onClose}
                    title={modalTitle}
                    footerTemplate={this._footer}
                >
                    <TextField
                        name="title"
                        label="Title*"
                        value={formValues?.title}
                        errorText={errorValues?.title}
                        onChangeText={title => this.setFormValues({title})}
                    />

                    <TagsField
                        name="tags"
                        label="Tags"
                        placeholder="Add tag(s)"
                        info="You can describe the tag(s) with ENTER key"
                        value={formValues?.tags || ""}
                        onChangeText={tags => this.setFormValues({tags})}
                        suggestions={autoSuggest}
                    />

                    <CommandField
                        name="command"
                        label="Command*"
                        value={formValues?.command || ""}
                        errorText={errorValues?.command}
                        onChangeText={command => this.setFormValues({command})}
                        placeholder={"Add command"}
                    />

                    <MarkdownField
                        name="description"
                        label="Description"
                        value={formValues?.description || ""}
                        onChangeText={description => this.setFormValues({description})}
                    />
                </Modal>
            </div>
        )
    }
}

SnippetCrudModal.propTypes = {
    id: PropTypes.string,
    show: PropTypes.bool,
    onClose: PropTypes.func
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

export default connect(mapStateToProps, mapDispatchToProps)(SnippetCrudModal);