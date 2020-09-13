import React, {Component} from "react";
import PropTypes from 'prop-types';

import './style.scss';
import SvgIcon from "../SvgIcon";


class CommandField extends Component {
    state = {
        fullscreen: false
    }

    componentDidMount() {
        this.refInput.selectionStart = this.refInput.value.length;
    }

    onChange = () => {
        const {onChangeText} = this.props;
        onChangeText && onChangeText(this.refInput.value);
    }

    toggleFullscreen = () => this.setState({fullscreen: !this.state.fullscreen});

    onClickItem = type => {
        let insertText = "";
        if (type === 'variable') {
            insertText = '[sc_variable name="Name" value="Demo" /]';
        } else if (type === 'choice') {
            insertText = '[sc_choice name="Name" value="Option #1,Option #2" /]';
        } else if (type === 'password') {
            insertText = '[sc_password name="Name" length="16" /]';
        }

        this.refInput.focus();

        if (this.refInput.selectionStart || this.refInput.selectionStart === 0) {
            const startPos = this.refInput.selectionStart;
            const endPos = this.refInput.selectionEnd;

            this.refInput.value = this.refInput.value.substring(0, startPos) + insertText + this.refInput.value.substring(endPos, this.refInput.value.length);
            this.refInput.selectionStart = startPos + insertText.length;
            this.refInput.selectionEnd = startPos + insertText.length;
        } else {
            this.refInput.value += insertText;
        }

        this.onChange(null);
    }

    render() {
        const {label, name, errorText, value} = this.props;
        const {fullscreen} = this.state;
        let formGroupClassName = 'form-group';
        if (errorText !== "") formGroupClassName += ' has-error';
        if (fullscreen) formGroupClassName += ' full';

        return (
            <div className="comp_fe_command-field">
                <div className={formGroupClassName}>
                    {label !== "" ? <label className="form-label" htmlFor={name}>{label}</label> : null}

                    <div className="command-container">
                        <div className="header">
                            <div className="navigation-nav left">
                                <div title="Variable" onClick={() => this.onClickItem('variable')} className="button">
                                    <SvgIcon name={"at"}/>
                                </div>
                                <div title="Choice (Select)" onClick={() => this.onClickItem('choice')}
                                     className="button">
                                    <SvgIcon name={"align-center"}/>
                                </div>
                                <div title="Password" onClick={() => this.onClickItem('password')} className="button">
                                    <SvgIcon name={"lock"}/>
                                </div>
                            </div>
                            <div className="navigation-nav right">
                                <div
                                    onClick={this.toggleFullscreen}
                                    title={fullscreen ? "Exit Full Screen" : "Full Screen"}
                                    className="button"
                                >
                                    {
                                        fullscreen
                                            ? <i className="rmel-iconfont rmel-icon-fullscreen-exit"> </i>
                                            : <i className="rmel-iconfont rmel-icon-fullscreen"> </i>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="body">
                            <textarea
                                name={name}
                                id={name}
                                ref={ref => this.refInput = ref}
                                onChange={this.onChange}
                                value={value}
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    {errorText !== "" ? <label className="error-label" htmlFor={name}>{errorText}</label> : null}
                </div>
            </div>
        )
    }
}

CommandField.defaultProps = {
    label: "",
    errorText: ""
}

CommandField.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChangeText: PropTypes.func,
    errorText: PropTypes.string
}

export default CommandField;