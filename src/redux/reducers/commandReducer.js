import {SET_COMMAND_LIST} from "../actions/commandActions";


const initialState = {
    commands: []
};

const commandReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_COMMAND_LIST:
            return {...state, commands: action.payload}
        default:
            return {...state};
    }
}

export default commandReducer;