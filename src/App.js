import React, {Component} from 'react';
import {Provider} from 'react-redux';

import TopMenu from './components/TopMenu';
import Sidebar from './components/Sidebar';
import store from "./redux/store";
import CommandArea from "./components/CommandArea";
import { StorageHelpers, ThemeHelpers } from "./core/Helpers";
import Footer from "./components/Footer";

import LoadingScreen from 'react-loading-screen'

import './components/common.scss';


class App extends Component {
    state = {
        isLoading: true
    }

    constructor(props) {
        super(props);

        this.setTheme();
        StorageHelpers.initDb();
        StorageHelpers.autoBackup();

        setInterval(StorageHelpers.autoBackup, 1000 * 60 * 60 * 6);
    }

    componentDidMount() {
        setTimeout(function () {
            this.setState({
                isLoading: false
            });
        }.bind(this), 1500);;;
    }

    setTheme = () => {
        const theme = `${ThemeHelpers.getCurrentAppTheme()}-theme`;
        
        if (!document.body.classList.contains(theme)) document.body.classList.add(theme);
    }

    render() {
        return (
            <LoadingScreen
                loading={this.state.isLoading}
                bgColor='#272727'
                spinnerColor='#9ee5f8'
                textColor='#676767'
                logoSrc='images/logo/snip_command.png'> 
                
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
            </LoadingScreen>
        );
    }
}

export default App;
