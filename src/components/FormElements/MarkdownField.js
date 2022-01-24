import React, {Component} from "react";
import {shell} from 'electron';
import PropTypes from 'prop-types';
import MdEditor from 'react-markdown-editor-lite';
import MarkdownIt from 'markdown-it';

import './style.scss';
import 'react-markdown-editor-lite/lib/index.css';


class MarkdownField extends Component {
    mdParser = new MarkdownIt();
    mdGuideLinkUrl = "https://www.markdownguide.org/basic-syntax/";

    onChange = (item) => {
        const {onChangeText} = this.props;
        onChangeText && onChangeText(item.text);
    }

    onClickHelp = async () => await shell.openExternal(this.mdGuideLinkUrl);

    render() {
        const {label, name, value, errorText} = this.props;
        let formGroupClassName = 'form-group';
        if (errorText !== "") formGroupClassName += ' has-error';

        return (
            <div className="fe_markdown-field">
                <div className={formGroupClassName}>
                    <div className="title-area">
                        {label !== "" ? <label className="form-label" htmlFor={name}>{label}</label> : null}
                        <div className="md-link-text" title={this.mdGuideLinkUrl} onClick={this.onClickHelp}>
                            <span>Markdown Guide</span>
                            <i className="fas fa-external-link-alt"> </i>
                        </div>
                    </div>

                    <MdEditor
                        renderHTML={(text) => this.mdParser.render(text)}
                        style={{height: '320px'}}
                        onChange={this.onChange}
                        plugins={['header', 'font-bold', 'font-italic', 'font-strikethrough', 'list-unordered', 'list-ordered', 'block-quote', 'block-wrap', 'block-code-inline', 'block-code-block', 'table', 'image', 'link', 'logger', 'mode-toggle', 'full-screen']}
                        value={value}
                        spellCheck={false}
                    />

                    {errorText !== "" ? <label className="error-label" htmlFor={name}>{errorText}</label> : null}
                </div>
            </div>
        )
    }
}

MarkdownField.defaultProps = {
    label: "",
    errorText: "",
    info: ""
}

MarkdownField.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    info: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChangeText: PropTypes.func,
    errorText: PropTypes.string
}

export default MarkdownField;