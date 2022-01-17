import { mdiCardsHeartOutline, mdiSelectAll, mdiTagMultipleOutline, mdiDeleteVariant } from './Icons';

// Sidebar Menu
const MainMenus = [{
        slug: 'all_commands',
        icon: mdiSelectAll,
        name: 'All Commands',
        type: 'menu'
    },
    {
        slug: 'favourites',
        icon: mdiCardsHeartOutline,
        name: 'Favourites',
        type: 'menu'
    },
    {
        slug: 'untagged',
        icon: mdiTagMultipleOutline,
        name: 'Untagged',
        type: 'menu'
    },
    {
        slug: 'trash',
        icon: mdiDeleteVariant,
        name: 'Trash',
        type: 'menu'
    },
];

const SearchResult = {
    slug: 'search_result',
    icon: 'search',
    name: 'Search Result',
    type: 'search'
};

const Keys = {
    enter: 13,
    tab: 9,
    backspace: 8,
    upArrow: 38,
    downArrow: 40,
    escape: 27,
}

const App = {
    name: 'SnipCommand',
    folderName: 'snipCommand',
    backupFolderName: 'backups',
    dbName: 'snipcommand.db'
}

export {
    MainMenus,
    Keys,
    SearchResult,
    App
};