import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './style.scss';


class TextField extends Component {
    render() {
        const {label, name, placeholder, value, onChangeText, errorText, readOnly} = this.props;
        let formGroupClassName = 'form-group';
        if (errorText !== "") formGroupClassName += ' has-error';

        return (
            <div className="comp_fe_text-field">
                <div className={formGroupClassName}>
                    {label !== "" ? <label className="form-label" htmlFor={name}>{label}</label> : null}
                    <input
                        name={name}
                        type="text"
                        className="form-control"
                        value={value || ""}
                        id={name}
                        placeholder={placeholder}
                        onChange={e => {
                            onChangeText && onChangeText(e.target.value)
                        }}
                        readOnly={readOnly}
                    />
                    {errorText !== "" ? <label className="error-label" htmlFor={name}>{errorText}</label> : null}
                </div>
            </div>
        )
    }
}

TextField.defaultProps = {
    label: "",
    errorText: "",
    readOnly: false
}

TextField.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChangeText: PropTypes.func,
    errorText: PropTypes.string,
    readOnly: PropTypes.bool
}

export default TextField;