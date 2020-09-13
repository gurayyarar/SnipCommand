import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './style.scss';


class ChoiceField extends Component {
    onChange = e => {
        const {onChangeText} = this.props;
        onChangeText && onChangeText(e.target.value);
    }

    render() {
        const {label, name, items, errorText} = this.props;
        let formGroupClassName = 'form-group';
        if (errorText !== "") formGroupClassName += ' has-error';

        return (
            <div className="comp_fe_choice-field">
                <div className={formGroupClassName}>
                    {label !== "" ? <label className="form-label" htmlFor={name}>{label}</label> : null}

                    <select id={name} onChange={this.onChange} className="form-control">
                        {
                            items.map((val, index) => {
                                return <option key={`choice_${index}`} value={val}>{val}</option>
                            })
                        }
                    </select>


                    {errorText !== "" ? <label className="error-label" htmlFor={name}>{errorText}</label> : null}
                </div>
            </div>
        )
    }
}

ChoiceField.defaultProps = {
    label: "",
    errorText: "",
    items: []
}

ChoiceField.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    items: PropTypes.array,
    onChangeText: PropTypes.func,
    errorText: PropTypes.string
}

export default ChoiceField;