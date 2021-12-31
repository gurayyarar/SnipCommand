import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import path from 'path';

import {StorageHelpers} from "./Helpers";
import {App} from "./Constants";

let db;

class Api {
    constructor(sortBy) {
        const dbFilePath = path.join(StorageHelpers.preference.get('storagePath'), App.dbName);
        const adapter = new FileSync(dbFilePath);
        this.sortBy = StorageHelpers.preference.get('sortBy');
        db = lowdb(adapter);
        db.defaults({commands: []}).write();
    }

    addNewCommandItem = item => db.get('commands').push(item).write();

    updateCommandItem = obj => db.get('commands').find({id: obj.id}).assign(obj).write();

    deleteCommandById = id => db.get('commands').remove({id}).write();

    getCommandById = id => db.get('commands').find({id}).value();

    getAllCommands = () => db.get('commands').filter({isTrash: false}).sortBy(this.sortBy === 'title' ? item => item.title.toLowerCase() : '').value();

    getAllCommandsInTrash = () => db.get('commands').filter({isTrash: true}).sortBy(this.sortBy === 'title' ? item => item.title.toLowerCase() : '').value();

    getAllUntaggedCommands = () => db.get('commands').filter({tags: "", isTrash: false} || {
        tags: null,
        isTrash: false
    }).sortBy(this.sortBy === 'title' ? item => item.title.toLowerCase() : '').value();

    getAllFavouriteCommands = () => db.get('commands').filter({isFavourite: true, isTrash: false}).sortBy(this.sortBy === 'title' ? item => item.title.toLowerCase() : '').value();

    getAllTags = () => db.get('commands').filter({isTrash: false}).map('tags').value();

    getCommandsContainsTag = tag => db.get('commands').filter((t => t.tags.indexOf(tag) > -1 && t.isTrash === false)).sortBy(this.sortBy === 'title' ? item => item.title.toLowerCase() : '').value();

    queryCommand = query => db.get('commands').filter((t => (t.title.toLowerCase().indexOf(query) > -1 || t.command.toLowerCase().indexOf(query) > -1) && t.isTrash === false)).sortBy(this.sortBy === 'title' ? item => item.title.toLowerCase() : '').value();
}

export default Api;