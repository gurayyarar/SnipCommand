import React from 'react';
import PropTypes from 'prop-types';

import CommandListItem from "../CommandListItem";


class CommandList extends React.Component {
    render() {
        const {items} = this.props;

        return (
            <>
                {
                    items.map((value, index) => {
                        return <CommandListItem key={index} item={value}/>
                    })
                }
            </>
        )
    }
}

CommandList.defaultProps = {
    items: []
}

CommandList.propTypes = {
    items: PropTypes.array
}

export default CommandList;