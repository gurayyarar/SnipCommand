import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {remote, shell} from 'electron';

import Modal from "../Modal";
import {Button, TextField} from "../FormElements";
import {NotyHelpers, ReduxHelpers, StorageHelpers} from "../../core/Helpers";
import {openConfirmDialog} from "../ConfirmDialog";
import {MainMenus} from "../../core/Constants";
import {version, description, author, links} from '../../../package.json';

import './style.scss';


class SettingsModal extends React.Component {
    state = {
        dbDirectory: '',
        backupDirectory: '',
        backupFiles: [],
        appTheme: 'light',
        onClickAction: 'open'
    }

    componentDidMount() {
        const dbDirectory = StorageHelpers.preference.get('storagePath');
        const backupDirectory = StorageHelpers.preference.get('backupPath');
        const appTheme = StorageHelpers.preference.get('appTheme') || 'light';
        const onClickAction = StorageHelpers.preference.get('onClickAction') || 'open';
        this.setState({dbDirectory, backupDirectory, appTheme, onClickAction});

        this.listBackupFiles();
    }

    onClickTabHeader = selectedTab => {
        const {tabChanged} = this.props;
        tabChanged && tabChanged(selectedTab);
    }

    openMoveStorage = type => {
        const {setCommandList} = this.props;

        const dir = remote.dialog.showOpenDialogSync({
            properties: ['openDirectory']
        })

        if (dir !== undefined) {
            if (type === 'move') {
                StorageHelpers.moveDb(dir[0]);
            } else {
                StorageHelpers.preference.set('storagePath', dir[0]);
                NotyHelpers.open('The storage opened successfully!', 'success', 2500);
                setCommandList();
            }
            this.setState({dbDirectory: dir[0]});
        }
    }

    changeOrBackupNow = type => {
        if (type === 'change') {
            const dir = remote.dialog.showOpenDialogSync({
                properties: ['openDirectory']
            });

            if (dir !== undefined) {
                StorageHelpers.preference.set('backupPath', dir[0]);
                this.setState({backupDirectory: dir[0]});
            }
        } else {
            StorageHelpers.backupNow();
            this.listBackupFiles();
            NotyHelpers.open('The backup process has been finished successfully!', 'success', 2500);
        }
    }

    restoreFromBackup = file => {
        const {setCommandList} = this.props;

        openConfirmDialog({
            title: 'Confirmation',
            text: 'Are you sure want to restore from backup? The current library will be overwritten!',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        StorageHelpers.restoreDb(file.filePath);
                        NotyHelpers.open('The storage restored from backup file successfully!', 'success', 2500);
                        setCommandList();
                    },
                    className: 'btn btn-success'
                },
                {
                    label: 'No',
                    onClick: () => null,
                    className: 'btn btn-default'
                }
            ]
        });
    }

    listBackupFiles = () => {
        const backupFiles = StorageHelpers.backupFiles();
        this.setState({backupFiles});
    }

    openLinkInBrowser = async slug => {
        await shell.openExternal(links[slug]);
    }

    changeTheme = appTheme => {
        document.body.classList.remove('light-theme');
        document.body.classList.remove('dark-theme');
        document.body.classList.add(`${appTheme}-theme`);
        StorageHelpers.preference.set('appTheme', appTheme);

        this.setState({appTheme});
    }

    changeOnClickAction = onClickAction => {
        StorageHelpers.preference.set('onClickAction', onClickAction);
        this.setState({onClickAction});
    }

    render() {
        const {dbDirectory, backupDirectory, backupFiles, appTheme, onClickAction} = this.state;
        const {show, onClose, selectedTab} = this.props;

        return (
            <div className="comp_settings-modal">
                <Modal
                    show={show}
                    onClose={onClose}
                    title={"PREFERENCES"}>

                    <div className="tabs-header-container">
                        <ul>
                            <li
                                className={selectedTab === 'storage' ? 'active' : ''}
                                onClick={() => this.onClickTabHeader('storage')}
                            >
                                <span>Storage</span>
                            </li>
                            <li
                                className={selectedTab === 'themes' ? 'active' : ''}
                                onClick={() => this.onClickTabHeader('themes')}
                            >
                                <span>Themes</span>
                            </li>
                            <li
                                className={selectedTab === 'settings' ? 'active' : ''}
                                onClick={() => this.onClickTabHeader('settings')}
                            >
                                <span>Settings</span>
                            </li>
                            <li
                                className={selectedTab === 'update' ? 'active' : ''}
                                onClick={() => this.onClickTabHeader('update')}
                            >
                                <span>Update</span>
                            </li>
                            <li
                                className={selectedTab === 'about' ? 'active' : ''}
                                onClick={() => this.onClickTabHeader('about')}
                            >
                                <span>About</span>
                            </li>
                        </ul>
                    </div>
                    <div className="tabs-content-container">
                        <div className={`content${selectedTab === 'storage' ? ' active' : ''}`}>
                            <div className="storage-directory-container">
                                <div className="sub-title">Storage Directory</div>
                                <div className="info">To use sync services like iCloud Drive, Google Drive of Dropbox,
                                    simply move storage to the corresponding synced folders.
                                </div>

                                <div className="form-container">
                                    <div className="input-container">
                                        <TextField
                                            name={""}
                                            readOnly={true}
                                            value={dbDirectory}
                                        />
                                    </div>
                                    <div className="buttons-container">
                                        <Button
                                            text={"Open Directory..."}
                                            styleType={"default"}
                                            title={"Open Storage Directory..."}
                                            onClick={() => this.openMoveStorage('open')}
                                        />

                                        <Button
                                            text={"Move Directory..."}
                                            styleType={"default"}
                                            title={"Move Storage Directory..."}
                                            onClick={() => this.openMoveStorage('move')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="storage-directory-backups-container">
                                <div className="sub-title">Storage Backups</div>
                                <div className="info">
                                    Backup will be created every 6 hours automatically when app is running.
                                </div>

                                <div className="form-container">
                                    <div className="input-container">
                                        <TextField
                                            name={""}
                                            readOnly={true}
                                            value={backupDirectory}
                                        />
                                    </div>
                                    <div className="buttons-container">
                                        <Button
                                            text={"Change Folder..."}
                                            styleType={"default"}
                                            onClick={() => this.changeOrBackupNow('change')}
                                        />

                                        <Button
                                            text={"Backup Now"}
                                            styleType={"default"}
                                            onClick={() => this.changeOrBackupNow('backup')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="storage-restore-container">
                                <div className="sub-title">Storage Restore</div>
                                <div className="info">You can restore from backups. Please be carefully when make this
                                    operation, because it will be overwritten!
                                </div>

                                <ul>
                                    {
                                        backupFiles.map((file, index) => {
                                            return (
                                                <li key={`restore_item_${index}`}>
                                                    <div className="name">{file?.name}</div>
                                                    <span onClick={() => this.restoreFromBackup(file)}>Restore</span>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>

                        </div>
                        <div className={`content${selectedTab === 'themes' ? ' active' : ''}`}>
                            <div className="theme-section">
                                <ul>
                                    <li onClick={() => this.changeTheme('light')}
                                        className={appTheme === 'light' ? 'active' : ''}>
                                        <div className="image-container">
                                            <img src={"./images/themes/light-theme.png"} alt="Light Theme" width={240}/>
                                        </div>
                                        <div className="text-container">Light Theme</div>
                                    </li>
                                    <li onClick={() => this.changeTheme('dark')}
                                        className={appTheme === 'dark' ? 'active' : ''}>
                                        <div className="image-container">
                                            <img src={"./images/themes/dark-theme.png"} alt="Dark Theme" width={240}/>
                                        </div>
                                        <div className="text-container">Dark Theme</div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className={`content${selectedTab === 'settings' ? ' active' : ''}`}>
                            <div className="settings-section">
                            <div className="info">On click action:</div>
                            <Button
                                text="Open"
                                styleType={onClickAction === 'open' ? 'success' : 'default'}
                                onClick={() => this.changeOnClickAction("open")}
                                />
                            <Button
                                text="Copy"
                                styleType={onClickAction === 'copy' ? 'success' : 'default'}
                                onClick={() => this.changeOnClickAction("copy")}
                                />
                            </div>
                            {onClickAction === 'copy'
                                ? <div className="info">Only commands without dynamic parameters will be copied directly.</div>
                                : null
                            }
                        </div>
                        <div className={`content${selectedTab === 'update' ? ' active' : ''}`}>
                            <div className="update-section">
                                <div className="info">You are using version of <b>{version}</b></div>
                                <Button
                                    text="Check For Updates..."
                                    styleType="default"
                                    onClick={() => this.openLinkInBrowser("releases")}
                                />
                            </div>
                        </div>
                        <div className={`content${selectedTab === 'about' ? ' active' : ''}`}>
                            <div className="about-section">
                                <img src={'./images/logo/snip_command.png'} width={100} alt="SnipCommand"/>
                                <div className="product-name">SnipCommand <small>{version}</small></div>
                                <div className="description">{description}</div>
                                <div className="created-by">
                                    <div className="text">Created by</div>
                                    <div className="author" onClick={() => this.openLinkInBrowser('author-page')}>
                                        {author.name}
                                    </div>
                                </div>

                                <div className="link-list">
                                    <div className="link" onClick={() => this.openLinkInBrowser('project-page')}>
                                        GitHub Page
                                    </div>
                                    <div className="link" onClick={() => this.openLinkInBrowser('license')}>
                                        License
                                    </div>
                                    <div className="link" onClick={() => this.openLinkInBrowser('changelogs')}>
                                        Changelogs
                                    </div>
                                    <div className="link" onClick={() => this.openLinkInBrowser('documentation')}>
                                        Documentation
                                    </div>
                                    <div className="link" onClick={() => this.openLinkInBrowser('issues')}>
                                        Report An Issue
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        )
    }
}

SettingsModal.propTypes = {
    show: PropTypes.bool,
    onClose: PropTypes.func,
    selectedTab: PropTypes.string,
    tabChanged: PropTypes.func
}

const mapDispatchToProps = (dispatch) => {
    return {
        setCommandList: () => ReduxHelpers.fillCommands(dispatch, MainMenus[0])
    }
}

export default connect(null, mapDispatchToProps)(SettingsModal);