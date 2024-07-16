const { ipcMain } = require("electron");
const { initBrowser, closeBrowser } = require("../../../globals/custom_puppeteer");

const ROOT_PATH = 'core';

const coreIpcs = {
    setting: (app) => {
        ipcMain.handle(`${ROOT_PATH}/create-browser`, async (event, arg) => {
            try {
                await initBrowser();
            } catch (err) {
                return {
                    message: `failure: ${err}`
                }
            }

            return {
                message: 'success'
            }
        });

        ipcMain.handle(`${ROOT_PATH}/close-browser`, async (event, arg) => {
            try {
                await closeBrowser();
            } catch (err) {
                return {
                    message: 'failure'
                }
            }

            return {
                message: 'success'
            }
        });
    }
}

module.exports = {
    coreIpcs: coreIpcs
}