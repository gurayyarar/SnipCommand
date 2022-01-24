import React, {Component} from "react";
import {render, unmountComponentAtNode} from 'react-dom';
import PropTypes from 'prop-types';

import './style.scss';


class ConfirmDialog extends Component {
    handleClickButton = button => {
        if (button.onClick) button.onClick()
        removeElementReconfirm()
    }

    render() {
        const {title, text, buttons} = this.props;

        return (
            <div className="confirm-modal">
                <div className="confirm-dialog-content">
                    <div className="confirm-dialog-header">
                        <div className="title">{title}</div>
                    </div>

                    <div className="confirm-dialog-body">
                        <div className="text" dangerouslySetInnerHTML={{__html: text}} />
                    </div>
                    
                    <div className="confirm-dialog-footer">
                        {
                            buttons.map((button, index) => {
                                return (
                                    <button key={index} onClick={() => this.handleClickButton(button)}
                                            className={button?.className}>
                                        {button?.label}
                                    </button>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }
}

ConfirmDialog.defaultProps = {
    buttons: [
        {
            label: 'Cancel',
            onClick: () => {
                alert('Cancel')
            },
            className: null
        },
        {
            label: 'Confirm',
            onClick: () => {
                alert('Confirm')
            },
            className: null
        }
    ]
}

ConfirmDialog.propTypes = {
    title: PropTypes.string,
    text: PropTypes.string,
    buttons: PropTypes.array
}

export default ConfirmDialog;

function createElementReconfirm(properties) {
    let divTarget = document.getElementById('react-custom-confirm-dialog')

    if (divTarget === null) {
        divTarget = document.createElement('div');
        divTarget.id = 'react-custom-confirm-dialog';
        document.body.appendChild(divTarget);
    }

    render(<ConfirmDialog {...properties} />, divTarget);
}

function removeElementReconfirm() {
    const target = document.getElementById('react-custom-confirm-dialog')
    if (target) {
        unmountComponentAtNode(target)
        target.parentNode.removeChild(target)
    }
}


export function openConfirmDialog(properties) {
    createElementReconfirm(properties);
}