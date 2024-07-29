const { ipcMain } = require("electron");
const { initBrowser, closeBrowser } = require("../../../globals/custom_puppeteer");
const crypto = require('crypto');
const { default: axios } = require("axios");
const { customSignitureUtils } = require("../../../utils/customSignitureUtils");

const ROOT_PATH = 'core';

const coreIpcs = {
    setting: (app, store) => {
        ipcMain.handle(`${ROOT_PATH}/create-browser`, async (event, arg) => {
            try {
                await initBrowser(arg?.testMode || false);
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

        ipcMain.handle(`${ROOT_PATH}/save-apiKey`, async (event, arg) => {
            store.set('apiKey', arg.apiKey);
            store.set('secretKey', arg.secretKey);
            return {
                message: 'success'
            }
        });

        ipcMain.handle(`${ROOT_PATH}/get-apiKey`, async (event, arg) => {
            return {
                message: 'success',
                content: {
                    apiKey: store.get('apiKey'),
                    secretKey: store.get('secretKey')
                }
            }
        });

        ipcMain.handle(`${ROOT_PATH}/generate-signiture`, async (event, arg) => {
            const apiKey = store.get('apiKey');
            const secretKey = store.get('secretKey');
            const timestamp = Date.now().toString();

            console.log(apiKey, secretKey)
            const signiture = customSignitureUtils.generateSigniture({ apiKey: apiKey, secretKey: secretKey, timestamp: timestamp });

            const headers = customSignitureUtils.makeHeaders({
                apiKey: apiKey, timestamp: timestamp, signiture: signiture
            })

            let result = await axios.get('http://localhost:7071/api/excel-translators', {
                headers: headers
            })
                .then(res => {
                    if (res?.status === 200) {
                        console.log(res?.status === 200);
                        return {
                            message: 'success',
                            content: res.data?.content
                        };
                    }
                })
                .catch(err => {
                    console.log(err);
                    return {
                        message: 'failure',
                        content: null
                    }
                })
            return result;
        });
    }
}

module.exports = {
    coreIpcs: coreIpcs
}