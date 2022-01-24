import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import path from 'path';

import {StorageHelpers} from "./Helpers";
import {App} from "./Constants";

import MiniSearch from 'minisearch';

let db;

class Api {
    constructor() {
        const dbFilePath = path.join(StorageHelpers.preference.get('storagePath'), App.dbName);
        const adapter = new FileSync(dbFilePath);
        db = lowdb(adapter);
        db.defaults({commands: []}).write();
    }

    addNewCommandItem = item => db.get('commands').push(item).write();

    updateCommandItem = obj => db.get('commands').find({id: obj.id}).assign(obj).write();

    deleteCommandById = id => db.get('commands').remove({id}).write();

    getCommandById = id => db.get('commands').find({id}).value();

    getAllCommands = () => db.get('commands').filter({isTrash: false}).value();

    getAllCommandsInTrash = () => db.get('commands').filter({isTrash: true}).value();

    getAllUntaggedCommands = () => db.get('commands').filter({tags: "", isTrash: false} || {
        tags: null,
        isTrash: false
    }).value();

    getAllFavouriteCommands = () => db.get('commands').filter({isFavourite: true, isTrash: false}).value();

    getAllTags = () => db.get('commands').filter({isTrash: false}).map('tags').value();

    getCommandsContainsTag = tag => db.get('commands').filter((t => t.tags.indexOf(tag) > -1 && t.isTrash === false)).value();

    /**
     * Search in commands
     * 
     * @param string query 
     * 
     * @returns array
     */
    queryCommand = (query) => {
        const commands = db.get('commands').value();

        if (commands && commands.length > 0) {
            query = query ? query : '';

            let miniSearch = new MiniSearch({
                fields: ['title', 'command', 'tags', 'description'],
                storeFields: ['title', 'command', 'tags', 'description']
            });

            miniSearch.addAll(commands);

            const results = miniSearch.search(query, {
                fuzzy: 0.5,
                prefix: true,
                boost: {
                    title: 2
                },
                filter: (item) => !item.isTrash
            });

            return results;
        }

        return [];
    };
}

export default Api;