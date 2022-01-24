import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {Keys} from "../../core/Constants";

import './style.scss';


class TagsField extends Component {
    state = {
        canDeletePrev: false,
        autoSuggest: []
    }
    lastInputValue = '';

    componentDidMount() {
        this.refContainer.addEventListener('click', this.onFocusInput);
        this.refInput.addEventListener('keyup', this.onKeyUpInput);
    }

    componentWillUnmount() {
        this.refContainer.removeEventListener('click', this.onFocusInput);
        this.refInput.removeEventListener('keyup', this.onKeyUpInput);
    }

    onDeleteItem = item => {
        const {value, onChangeText} = this.props;
        const tags = value !== "" && value !== null && value !== undefined ? value.split(',') : [];

        tags.splice(tags.indexOf(item), 1);
        onChangeText && onChangeText(tags.join(','));
    }

    onFocusInput = () => this.refInput.focus();

    onKeyUpInput = e => {
        e.preventDefault();

        const {value, onChangeText, suggestions} = this.props;
        const {canDeletePrev, autoSuggest} = this.state;

        const inputTextValue = e.target.value;
        const tags = value !== "" && value !== null && value !== undefined ? value.split(',') : [];

        if (e.keyCode === Keys.enter) {
            if (inputTextValue && inputTextValue !== '' && tags.indexOf(inputTextValue) === -1) {
                tags.push(inputTextValue);
                onChangeText && onChangeText(tags.join(','));
                e.target.value = '';
                this.setState({autoSuggest: [], canDeletePrev: true});
            }
        } else if (e.keyCode === Keys.backspace) {
            if (canDeletePrev && inputTextValue === '' && tags.length > 0) {
                tags.pop();
                onChangeText && onChangeText(tags.join(','));
            }
            if (inputTextValue === '') this.setState({canDeletePrev: true});
        } else if (e.keyCode === Keys.downArrow) {
            let index = autoSuggest.findIndex(o => o.isActive);
            index = index + 1 === autoSuggest.length ? 0 : index + 1;

            _.forEach(autoSuggest, (val, ix) => {
                if (index === ix) {
                    val.isActive = true;
                    e.target.value = val.text;
                } else {
                    val.isActive = false;
                }
            });

            this.setState({autoSuggest});
        } else if (e.keyCode === Keys.upArrow) {
            let index = autoSuggest.findIndex(o => o.isActive);
            index = index - 1 < 0 ? autoSuggest.length - 1 : index - 1;

            _.forEach(autoSuggest, (val, ix) => {
                if (index === ix) {
                    val.isActive = true;
                    e.target.value = val.text;
                } else {
                    val.isActive = false;
                }
            });

            this.setState({autoSuggest});
        }

        if (e.keyCode !== Keys.downArrow && e.keyCode !== Keys.upArrow && e.keyCode !== Keys.enter) {
            this.lastInputValue = inputTextValue;

            if (inputTextValue !== '') {
                const autoSuggests = [];
                _.forEach(suggestions, (val) => {
                    if (val.indexOf(inputTextValue) > -1 && value.indexOf(val) === -1) {
                        autoSuggests.push({
                            text: val,
                            isActive: false
                        });
                    }
                });
                this.setState({autoSuggest: autoSuggests, canDeletePrev: false});
            } else {
                this.setState({autoSuggest: [], canDeletePrev: true});
            }
        }
    }

    onClickAutoSuggestItem = text => {
        const {value, onChangeText} = this.props;
        const tags = value !== "" && value !== null && value !== undefined ? value.split(',') : [];

        if (tags.indexOf(text) === -1) {
            this.refInput.value = '';
            tags.push(text);
            onChangeText && onChangeText(tags.join(','));
            this.setState({autoSuggest: [], canDeletePrev: true});
        }
    }

    boldQuery = (str) => {
        const n = str.toUpperCase();
        const q = this.lastInputValue.toUpperCase();
        const x = n.indexOf(q);
        if (!q || x === -1) return str;
        const l = q.length;
        return `${str.substr(0, x)}<b>${str.substr(x, l)}</b>${str.substr(x + l)}`;
    }

    render() {
        const {label, info, name, placeholder, value, errorText} = this.props;
        const {autoSuggest} = this.state;
        const tags = value !== "" && value !== null && value !== undefined ? value.split(',') : [];

        let formGroupClassName = 'form-group';
        if (errorText !== "") formGroupClassName += ' has-error';

        return (
            <div className="fe_tags-field">
                <div className={formGroupClassName}>
                    <div className="title-area">
                        {label !== "" ? <label className="form-label" htmlFor={name}>{label}</label> : null}
                        {info !== "" ? <label className="info-text" htmlFor={name}>{info}</label> : null}
                    </div>

                    <div ref={ref => this.refContainer = ref} className="tags-input-main-container">
                        {
                            tags.map((val, index) => {
                                return (
                                    <div key={index} className="tag-wrapper">
                                        <span className="tag-text">{val}</span>
                                        <span onClick={() => this.onDeleteItem(val)} className="close-link">×</span>
                                    </div>
                                )
                            })
                        }
                        <div className="input-container">
                            <input
                                ref={ref => this.refInput = ref}
                                type="text" className="form-element"
                                placeholder={placeholder} id={name}
                            />
                            {
                                autoSuggest.length > 0
                                    ? (
                                        <div className="auto-suggestion-container">
                                            <ul>
                                                {
                                                    autoSuggest.map((value, index) => {
                                                        return (
                                                            <li onClick={() => this.onClickAutoSuggestItem(value.text)}
                                                                className={value.isActive ? 'active' : ""} key={index}
                                                                dangerouslySetInnerHTML={{__html: this.boldQuery(value.text)}}
                                                            >
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    )
                                    : null
                            }
                        </div>
                    </div>
                    {errorText !== "" ? <label className="error-label" htmlFor={name}>{errorText}</label> : null}
                </div>
            </div>
        )
    }
}

TagsField.defaultProps = {
    errorText: "",
    info: "",
    label: ""
}

TagsField.propTypes = {
    label: PropTypes.string,
    info: PropTypes.string,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChangeText: PropTypes.func,
    errorText: PropTypes.string,
    suggestions: PropTypes.array
}

export default TagsField;