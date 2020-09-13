const {Menu, shell, ipcRenderer, BrowserWindow} = require("electron");
const {links} = require('../package.json');
const isMac = process.platform === "darwin";

const template = [
    {
        label: "File",
        submenu: [
            {
                label: 'Preferences...', click: () => {
                    BrowserWindow.getFocusedWindow().webContents.send('appMenu', {type: 'preferences', tab: 'storage'});
                }
            },
            {type: "separator"},
            isMac ? {role: "close"} : {role: "quit"},
        ]
    },
    {
        label: "View",
        submenu: [
            {role: "reload"},
            {type: "separator"},
            {role: "toggledevtools"}
        ]
    },
    {
        role: "help",
        submenu: [
            {
                label: "GitHub Page",
                click: async () => {
                    await shell.openExternal(links["project-page"]);
                }
            },
            {
                label: "License",
                click: async () => {
                    await shell.openExternal(links.license);
                }
            },
            {
                label: "Changelogs",
                click: async () => {
                    await shell.openExternal(links.changelogs);
                }
            },
            {
                label: "Documentation",
                click: async () => {
                    await shell.openExternal(links.documentation);
                }
            },
            {
                label: "Report An Issues",
                click: async () => {
                    await shell.openExternal(links.issues);
                }
            },
            {type: "separator"},
            {
                label: "Author GitHub Page",
                click: async () => {
                    await shell.openExternal(links["author-page"]);
                }
            },
            {
                label: "Check For Updates",
                click: async () => {
                    await shell.openExternal(links.releases);
                }
            },
            {type: "separator"},
            {
                label: "About",
                click: () => {
                    BrowserWindow.getFocusedWindow().webContents.send('appMenu', {type: 'preferences', tab: 'about'});
                }
            },
        ]
    }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
module.exports = {
    menu
};