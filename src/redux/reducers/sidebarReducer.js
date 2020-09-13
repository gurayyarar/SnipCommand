import {SET_SELECTED_MENU_ITEM, SET_TAGS} from "../actions/sidebarActions";
import {MainMenus} from "../../core/Constants";

const initialState = {
    selectedMenu: MainMenus[0],
    tags: []
};

const sidebarReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_SELECTED_MENU_ITEM:
            return {...state, selectedMenu: action.payload}
        case SET_TAGS:
            return {...state, tags: action.payload}
        default:
            return {...state};
    }
}

export default sidebarReducer;