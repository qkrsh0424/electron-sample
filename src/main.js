const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { smartstoreIpcs } = require('./domain/smartstore/ipcs/smartstoreIpcs');
const { screenshotIpcs } = require('./domain/screenshot/ipcs/screenshotIpcs');
const { coreIpcs } = require('./domain/core/ipcs/codeIpcs');
// const isDev = require('electron-is-dev');

const isDev = !app.isPackaged;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: false, // true로 설정
            enableRemoteModule: false, // 가능한 경우 사용하지 않도록 설정
            nodeIntegration: true // true 대신 false로 설정
        }
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
        // mainWindow.loadFile(path.join(__dirname, '../index.html'));
    } else {
        // mainWindow.loadURL('http://localhost:3000');
        mainWindow.loadFile(path.join(__dirname, '../client/build/index.html'));
        // mainWindow.loadFile(path.join(__dirname, '../index.html'));

    }

}

app.whenReady().then(() => {
    coreIpcs.setting(app);
    smartstoreIpcs.setting(app);
    screenshotIpcs.setting();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});