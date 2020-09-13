import React from "react";

import {version} from '../../../package.json';

import './style.scss';


class Footer extends React.Component {
    render() {
        return (
            <div className="comp_footer">
                <div className="left-side">
                    <div className="app-name">SnipCommand <small>{version}</small></div>
                </div>
                <div className="right-side"/>
            </div>
        )
    }
}


export default Footer;