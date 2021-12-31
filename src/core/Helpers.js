import _ from 'lodash';
import shortid from 'shortid';
import Noty from "noty";
import {platform, homedir} from 'os';
import Store from 'electron-store';
import moment from 'moment';

import Api from "./Api";
import {SET_SELECTED_MENU_ITEM, SET_TAGS} from "../redux/actions/sidebarActions";
import {SET_COMMAND_LIST} from "../redux/actions/commandActions";

import "noty/src/noty.scss";
import "noty/src/themes/sunset.scss";
import {App} from "./Constants";
import fs from "fs";
import path from "path";

const isWin = platform() === 'win32';
const defaultPath = isWin ? `${homedir()}\\${App.folderName}` : `${homedir()}/${App.folderName}`;
const backupPath = isWin ? `${defaultPath}\\${App.backupFolderName}` : `${defaultPath}/${App.backupFolderName}`;
const storagePrefences = new Store({
    name: 'preferences',
    schema: {
        storagePath: {
            default: defaultPath
        },
        backupPath: {
            default: backupPath
        }
    }
})


const CommandHelpers = {
    organizeCommands: text => {
        const result = [];
        const matchedItems = text.match(new RegExp(`\\[s\\s*(.*?)\\s*\\/]`, 'g'));

        _.forEach(matchedItems, (val) => {
            let type = 'variable';

            if (val.indexOf('sc_choice') > -1) {
                type = 'choice';
            } else if (val.indexOf('sc_password') > -1) {
                type = 'password';
            }

            result.push({
                id: shortid.generate(),
                type,
                name: val.match(/name="(.*?)"/)[1],
                value: val.match(val.indexOf('sc_password') > -1 ? /length="(.*?)"/ : /value="(.*?)"/)[1]
            });
        });

        return result;
    },

    replacedCommand: (text, paramsAsObj) => {
        const params = [];
        const matchedItems = text.match(new RegExp(`\\[s\\s*(.*?)\\s*\\/]`, 'g'));
        _.forOwn(paramsAsObj, o => params.push(o));

        _.forEach(matchedItems, (val, index) => {
            text = text.replace(val, params[index]);
        });

        return text;
    },

    commandAsHtml: text => {
        const matchedItems = text.match(new RegExp(`\\[s\\s*(.*?)\\s*\\/]`, 'g'));

        _.forEach(matchedItems, (val) => {
            text = text.replace(val, `<span>&#60;${val.match(/name="(.*?)"/)[1]}&#62;</span>`)
        });

        return text
    },

    getCommands: (selectedMenu, query) => {
        let result = [];
        if (selectedMenu) {
            const slug = selectedMenu.slug;

            if (selectedMenu.type === 'menu') {
                if (slug === 'all_commands') {
                    result = new Api().getAllCommands();
                } else if (slug === 'favourites') {
                    result = new Api().getAllFavouriteCommands();
                } else if (slug === 'untagged') {
                    result = new Api().getAllUntaggedCommands();
                } else if (slug === 'trash') {
                    result = new Api().getAllCommandsInTrash();
                }
            } else if (selectedMenu.type === 'search') {
                result = new Api().queryCommand(query.toLowerCase());
            } else {
                result = new Api().getCommandsContainsTag(slug);
            }
        }

        return result;
    }
}

const TagHelpers = {
    getAllItems: () => {
        let tagsAsStr = "";

        _.forEach(new Api().getAllTags(), key => {
            if (key !== null && key !== "" && key !== undefined) tagsAsStr += `${key},`;
        });

        if (tagsAsStr === "") return [];

        tagsAsStr = tagsAsStr.substring(0, tagsAsStr.length - 1);
        return _.sortBy(_.uniq(tagsAsStr.split(',')));
    }
}

const ReduxHelpers = {
    fillTags: dispatch => dispatch({
        type: SET_TAGS,
        payload: TagHelpers.getAllItems()
    }),

    fillCommands: (dispatch, selectedMenu, query) => dispatch({
        type: SET_COMMAND_LIST,
        payload: CommandHelpers.getCommands(selectedMenu, query)
    }),

    setSelectedMenu: (dispatch, selectedMenu) => dispatch({
        type: SET_SELECTED_MENU_ITEM,
        payload: selectedMenu
    })
}

const NotyHelpers = {
    open: (text, type, timeout) => {
        new Noty({
            text,
            theme: 'sunset',
            layout: 'bottomRight',
            type,
            progressBar: false,
            timeout
        }).show();
    },
    closeAll: () => {
        new Noty().close();
    }
}

const StorageHelpers = {
    preference: storagePrefences,

    initDb: () => {
        const appDir = storagePrefences.get('storagePath').toString();
        const backupsDir = storagePrefences.get('backupPath').toString();

        if (!fs.existsSync(appDir)) {
            fs.mkdirSync(appDir);
            fs.appendFileSync(path.join(appDir, App.dbName), "");
        }

        if (!fs.existsSync(backupsDir)) {
            fs.mkdirSync(backupsDir);
        }
    },

    moveDb: (willMoveDir) => {
        const dbFileExistPath = path.join(storagePrefences.get('storagePath').toString(), App.dbName);
        const dbFileNewPath = path.join(willMoveDir, App.dbName);

        if (!fs.existsSync(willMoveDir)) {
            fs.mkdirSync(willMoveDir);
        }

        fs.renameSync(dbFileExistPath, dbFileNewPath);
        storagePrefences.set('storagePath', willMoveDir);
    },

    restoreDb: (willRestoreFilePath) => {
        const appDir = storagePrefences.get('storagePath').toString();

        if (!fs.existsSync(appDir)) {
            fs.mkdirSync(appDir);
        }

        fs.copyFileSync(willRestoreFilePath, path.join(appDir, App.dbName));
    },

    autoBackup: () => {
        const backupFiles = StorageHelpers.getBackupFiles();

        if (backupFiles.length === 0) {
            StorageHelpers.backupNow();
        } else {
            const lastBackupDate = moment(backupFiles[0].date).add(6, 'hours');
            const now = moment();

            if (now.isAfter(lastBackupDate)) {
                StorageHelpers.backupNow();
            }
        }
    },

    backupNow: () => {
        const dbFilePath = path.join(storagePrefences.get('storagePath').toString(), App.dbName);
        const dbBackupDir = path.join(storagePrefences.get('backupPath').toString(), moment().format('YYYY-MM-DD_HH-mm-ss'));

        if (!fs.existsSync(dbBackupDir)) {
            fs.mkdirSync(dbBackupDir);
        }

        fs.copyFileSync(dbFilePath, path.join(dbBackupDir, App.dbName));
    },

    /**
     * Get backup file list
     * 
     * @returns array
     */
    getBackupFiles: () => {
        const result = [],
            backupDir = storagePrefences.get('backupPath').toString(),
            folders = fs.readdirSync(backupDir);

        folders.forEach((value) => {
            const momentVal = moment(value, 'YYYY-MM-DD_HH-mm-ss');

            if (momentVal.isValid()){
                result.push({
                    name: momentVal.format('DD MMM YYYY, HH:mm:ss'),
                    timeAgo: momentVal.fromNow(),
                    filePath: path.join(backupDir, value, App.dbName),
                    date: momentVal.format('YYYY-MM-DD HH:mm:ss')
                });
            } else {
                console.warn(`Backup file date is invalid: '${value}'`);
            }
        });

        return result.reverse();
    }
}

export {CommandHelpers, TagHelpers, ReduxHelpers, NotyHelpers, StorageHelpers};