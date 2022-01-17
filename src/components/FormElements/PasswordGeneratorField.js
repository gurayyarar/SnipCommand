import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Icon from '@mdi/react';
import {
    mdiRefresh,
} from "../../core/Icons";

import './style.scss';


class PasswordGeneratorField extends Component {
    render() {
        const {label, name, value, onChangeText, errorText} = this.props;
        let formGroupClassName = 'form-group';
        if (errorText !== "") formGroupClassName += ' has-error';

        return (
            <div className="comp_fe_password-field">
                <div className={formGroupClassName}>
                    { label !== "" ? <label className="form-label" htmlFor={name}>{label}</label> : null }

                    <input id={name} type="text" value={value} className="form-control" readOnly/>

                    <button title="Refresh Password" onClick={() => { onChangeText && onChangeText() }}>
                        <Icon path={mdiRefresh} size="20px"/>
                    </button>

                    {errorText !== "" ? <label className="error-label" htmlFor={name}>{errorText}</label> : null}
                </div>
            </div>
        )
    }
}

PasswordGeneratorField.defaultProps = {
    label: "",
    errorText: "",
    value: ""
}

PasswordGeneratorField.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChangeText: PropTypes.func,
    errorText: PropTypes.string
}

export default PasswordGeneratorField;