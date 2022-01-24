import React from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { remote, shell } from 'electron';

import Modal from "../Modal";
import { Button, TextField } from "../FormElements";
import { NotyHelpers, ReduxHelpers, StorageHelpers, ThemeHelpers } from "../../core/Helpers";
import { openConfirmDialog } from "../ConfirmDialog";
import { MainMenus } from "../../core/Constants";
import { version, description, author, links } from '../../../package.json';

import './style.scss';

class SettingsModal extends React.Component {
    state = {
        dbDirectory: '',
        backupDirectory: '',
        backupFiles: [],
        appTheme: 'light',
        systemTheme: ThemeHelpers.getSystemTheme()
    }

    componentDidMount() {
        this.setState({
            dbDirectory: StorageHelpers.preference.get('storagePath'), 
            backupDirectory: StorageHelpers.preference.get('backupPath'), 
            appTheme: StorageHelpers.preference.get('appTheme') || 'light'
        });

        this.listBackupFiles();

        // update theme when os theme changed
        remote.nativeTheme.on('updated', () => {
            if (this.state.appTheme === 'system'){
                this.changeTheme('system');
            }
        });
    }

    /**
     * Load backup files list
     */
    listBackupFiles = () => {
        this.setState({
            backupFiles: StorageHelpers.getBackupFiles()
        });
    }

    /**
     * Change backup folder
     * 
     * @param string type 
     */
    openMoveStorage = (type) => {
        const { setCommandList } = this.props;

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

    /**
     * Change backups folder or backup now
     * 
     * @param string type 
     */
    changeOrBackupNow = (type) => {
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

    /**
     * Restore specific backup file
     * 
     * @param file 
     */
    restoreFromBackup = (file) => {
        const { setCommandList } = this.props;

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

    /**
     * Change current theme and apply
     * 
     * @param string selectedTheme 
     */
    changeTheme = (selectedTheme) => {
        let applyTheme = selectedTheme === 'system' ? ThemeHelpers.getSystemTheme() : selectedTheme;

        document.body.classList.remove('light-theme');
        document.body.classList.remove('dark-theme');
        document.body.classList.add(applyTheme + '-theme');

        StorageHelpers.preference.set('appTheme', selectedTheme);

        this.setState({appTheme: selectedTheme});
    }

    /**
     * Open target URL in browser
     * 
     * @param string slug 
     */
    openLinkInBrowser = async (slug) => {
        await shell.openExternal(links[slug]);
    }
    
    /**
     * Switch target tab
     * 
     * @param string selectedTab 
     */
    onClickTabHeader = (selectedTab) => {
        const { tabChanged } = this.props;

        tabChanged && tabChanged(selectedTab);
    }

    render() {
        const {dbDirectory, backupDirectory, backupFiles, appTheme} = this.state;
        const {show, onClose, selectedTab} = this.props;

        return (
            <div className="settings-modal">
                <Modal
                    show={show}
                    onClose={onClose}
                    title={"PREFERENCES"}>

                    {/* Tab Headers */}
                    <div className="tabs-header-container">
                        <ul>
                            <li className={selectedTab === 'storage' ? 'active' : ''}
                                onClick={() => this.onClickTabHeader('storage')}>
                                <span>Storage</span>
                            </li>
                            <li className={selectedTab === 'themes' ? 'active' : ''}
                                onClick={() => this.onClickTabHeader('themes')}>
                                <span>Themes</span>
                            </li>
                            <li className={selectedTab === 'update' ? 'active' : ''}
                                onClick={() => this.onClickTabHeader('update')}>
                                <span>Update</span>
                            </li>
                            <li className={selectedTab === 'about' ? 'active' : ''}
                                onClick={() => this.onClickTabHeader('about')}>
                                <span>About</span>
                            </li>
                        </ul>
                    </div>

                    <div className="tabs-content-container">
                        {/* Storage Tab */}
                        <div className={`content${selectedTab === 'storage' ? ' active' : ''}`}>
                            {/* Storage Directory */}
                            <div className="storage-directory-container">
                                <div className="sub-title">
                                    Storage Directory
                                </div>

                                <div className="info">
                                    To use sync services like iCloud Drive, Google Drive of Dropbox, 
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

                            {/* Storage Backups */}
                            <div className="storage-directory-backups-container">
                                <div className="sub-title">
                                    Storage Backups
                                </div>

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

                            {/* Storage Restore */}
                            <div className="storage-restore-container">
                                <div className="sub-title">
                                    Storage Restore
                                </div>

                                <div className="info">
                                    You can restore from backups. Please be carefully when make this operation, because it will be overwritten!
                                </div>

                                {/* Backup List */}
                                <ul>
                                    <li>
                                        <div className="name">
                                            Backup Date
                                        </div>
                                    </li>

                                    {
                                        backupFiles.map((file, index) => {
                                            return (
                                                <li key={`restore_item_${index}`}>
                                                    <div className="name">
                                                        {file?.name}
                                                    </div>

                                                    <div className='time-ago'>
                                                        ({file?.timeAgo})
                                                    </div>

                                                    <span className='restore' onClick={() => this.restoreFromBackup(file)}>
                                                        Restore
                                                    </span>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                        </div>

                        {/* Theme Tab */}
                        <div className={`content${selectedTab === 'themes' ? ' active' : ''}`}>
                            <div className="theme-section">
                                <ul>
                                    <li onClick={() => this.changeTheme('light')} className={appTheme === 'light' ? 'active' : ''}>
                                        <div className="image-container">
                                            <img src={"./images/themes/light-theme.png"} alt="Light Theme"/>
                                        </div>

                                        <div className="text-container">
                                            Light Theme
                                        </div>
                                    </li>

                                    <li onClick={() => this.changeTheme('dark')} className={appTheme === 'dark' ? 'active' : ''}>
                                        <div className="image-container">
                                            <img src={"./images/themes/dark-theme.png"} alt="Dark Theme"/>
                                        </div>

                                        <div className="text-container">
                                            Dark Theme
                                        </div>
                                    </li>

                                    <li onClick={() => this.changeTheme('system')} className={appTheme === 'system' ? 'active' : ''}>
                                        <div className="image-container">
                                            <img src={"./images/themes/system-theme.png"} alt="System Theme"/>
                                        </div>

                                        <div className="text-container">
                                            Follow System Theme
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Version Tab */}
                        <div className={`content${selectedTab === 'update' ? ' active' : ''}`}>
                            <div className="update-section">
                                <div className="info">
                                    You are using version of <b>{version}</b>
                                </div>

                                <Button
                                    text="Check For Updates..."
                                    styleType="default"
                                    onClick={() => this.openLinkInBrowser("releases")}
                                />
                            </div>
                        </div>

                        {/* About Tab */}
                        <div className={`content${selectedTab === 'about' ? ' active' : ''}`}>
                            <div className="about-section">
                                <img src={'./images/logo/snip_command.png'} width={100} alt="SnipCommand"/>
                                
                                <div className="product-name">
                                    SnipCommand <small>{version}</small>
                                </div>

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