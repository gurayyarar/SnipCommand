import {combineReducers} from 'redux';

import sidebarReducer from "./sidebarReducer";
import commandReducer from "./commandReducer";
import searchReducer from "./searchReducer";


const rootReducer = combineReducers({
    sidebar: sidebarReducer,
    command: commandReducer,
    search: searchReducer
});


export default rootReducer;