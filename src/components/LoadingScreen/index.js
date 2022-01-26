import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BarLoader from "react-spinners/BarLoader";

import './style.scss';

class LoadingScreen extends Component {
    render() {
        const {isLoading, logoSrc} = this.props;

        let loadingScreenClass = 'loading-screen';
        
        if (isLoading) loadingScreenClass = 'loading-screen loading';

        return (
            <>
                <div className={loadingScreenClass}>
                    <div className="logo-container">
                        {
                            logoSrc && <img src={logoSrc} alt="logo"/>
                        }

                        {
                            isLoading && <BarLoader color='#e4763b' loading={isLoading} 
                                height={5} width={100}/>
                        }
                    </div>
                    
                    <div className='loading-screen-content'>
                        {this.props.children}
                    </div>
                </div>
            </>
        );
    }
}

LoadingScreen.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    logoSrc: PropTypes.string.isRequired
}

export default LoadingScreen;