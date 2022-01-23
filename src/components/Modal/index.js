import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './style.scss';

class Modal extends Component {
    render() {
        const {show, title, onClose, children, footerTemplate} = this.props;
        let modalClassName = 'comp_modal';
        
        if (show) modalClassName += ' visible';

        return (
            <div className={modalClassName}>
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="title">
                            {title}
                        </div>

                        <button className="btn-close" onClick={onClose && onClose}>
                            <span> </span>
                            <span> </span>
                        </button>
                    </div>

                    <div className="modal-body">
                    {children}
                    </div>

                    {
                        footerTemplate && <div className="modal-footer">
                            {footerTemplate()}
                        </div>
                    }
                </div>

                <div onClick={onClose && onClose} className="modal-overlay"/>
            </div>
        );
    }
}

Modal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
    footerTemplate: PropTypes.any
}

export default Modal;