import React, {Component} from 'react';
import PropTypes from 'prop-types';

import SvgIcon from "../SvgIcon";

import './style.scss';


class SearchField extends Component {
    render() {
        const {placeholder, value, onChangeText, onClearClick} = this.props;

        return (
            <div className="comp_fe_search-field">
                <div className="search-container">
                    <div className="search-icon-container">
                        <SvgIcon name={"search"}/>
                    </div>
                    <input
                        type="text"
                        className="form-control"
                        value={value || ""}
                        placeholder={placeholder}
                        onChange={e => {
                            onChangeText && onChangeText(e.target.value)
                        }}
                    />
                    {
                        value !== "" && value !== null
                            ? (
                                <div onClick={() => {
                                    onClearClick && onClearClick()
                                }} className="clear-icon-container">
                                    <SvgIcon name={"times_circle"}/>
                                </div>
                            )
                            : null
                    }
                </div>
            </div>
        )
    }
}

SearchField.propTypes = {
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChangeText: PropTypes.func,
    onClearClick: PropTypes.func
}

export default SearchField;