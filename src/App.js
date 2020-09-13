import React, {Component} from 'react';
import {Provider} from 'react-redux';

import TopMenu from './components/TopMenu';
import Sidebar from './components/Sidebar';
import store from "./redux/store";
import CommandArea from "./components/CommandArea";
import {StorageHelpers} from "./core/Helpers";
import Footer from "./components/Footer";

import './components/common.scss';


class App extends Component {
    constructor(props) {
        super(props);
        this.setTheme();
        StorageHelpers.initDb();
        StorageHelpers.autoBackup();
        setInterval(StorageHelpers.autoBackup, 1000 * 60 * 60 * 6);
    }

    setTheme = () => {
        const theme = `${StorageHelpers.preference.get('appTheme') || 'light'}-theme`;
        if (!document.body.classList.contains(theme)) document.body.classList.add(theme);
    }

    render() {
        return (
            <Provider store={store}>
                <div className="top-menu-container">
                    <TopMenu/>
                </div>
                <div className="content-main-container">
                    <div className="sidebar-container">
                        <Sidebar/>
                    </div>
                    <div className="content-container">
                        <CommandArea/>
                    </div>
                </div>
                <div className="footer-container">
                    <Footer/>
                </div>
            </Provider>
        );
    }
}

export default App;
