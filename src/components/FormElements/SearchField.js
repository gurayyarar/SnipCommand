import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Icon from '@mdi/react';
import {
    mdiMagnify,
    mdiWindowClose,
} from "../../core/Icons";

import './style.scss';


class SearchField extends Component {
    componentDidMount() {
        this.bindSearchFocusEvent();    
    }

    /**
     * Auto search focus with '/' key
     */
    bindSearchFocusEvent = () => {
        document.addEventListener('keyup', (e) => {
            if (!e.repeat){
                if (e.key === '/'){
                    const modals = document.querySelectorAll('.comp_modal');

                    let openModals = [];
        
                    if (modals && modals.length){
                        openModals = [...modals].map((x) => x.classList.contains('visible')).filter((x) => x);
                    }

                    // disable auto serarch focus while any modal open
                    if (openModals.length > 0){
                        return;
                    }

                    this.searchInput.focus();
                }
            }
        });
    }

    render() {
        const {placeholder, value, onChangeText, onClearClick} = this.props;

        return (
            <div className="comp_fe_search-field">
                <div className="search-container">
                    <div className="search-icon-container">
                        <Icon path={mdiMagnify} size="20px"/>
                    </div>

                    <input ref={(input) => { this.searchInput = input; }} 
                        type="text" className="form-control" value={value || ""}
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
                                    <Icon path={mdiWindowClose} size="20px"/>
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