import React, {Component} from "react";
import PropTypes from 'prop-types';

import './style.scss';


class Button extends Component {
    render() {
        const {text, styleType, onClick, title} = this.props;
        let buttonClassName = `btn btn-${styleType}`;

        return <button className={buttonClassName} title={title} onClick={onClick && onClick}>{text}</button>;
    }
}

Button.defaultProps = {
    styleType: 'default',
    title: ""
}

Button.propTypes = {
    text: PropTypes.string,
    styleType: PropTypes.oneOf(['default', 'success', 'danger']),
    onClick: PropTypes.func,
    title: PropTypes.string
}

export default Button;