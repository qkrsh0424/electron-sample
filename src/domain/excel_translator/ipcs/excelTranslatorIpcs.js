const { ipcMain } = require("electron");
const { default: axios } = require("axios");
const { customSignitureUtils } = require("../../../utils/customSignitureUtils");
const { customUrlUtils } = require('../../../utils/customUrlUtils');

const excelTranslatorIpcs = {
    setting: (app, store) => {
        const ROOT_PATH = 'excel-translators';
        const API_SERVER_URL = customUrlUtils.API_SERVER_URL;

        ipcMain.handle(`${ROOT_PATH}/searchList`, async (event, arg) => {
            const apiKey = store.get('apiKey');
            const secretKey = store.get('secretKey');
            const timestamp = Date.now().toString();

            const signiture = customSignitureUtils.generateSigniture({ apiKey: apiKey, secretKey: secretKey, timestamp: timestamp });

            const headers = customSignitureUtils.makeHeaders({
                apiKey: apiKey, timestamp: timestamp, signiture: signiture
            })

            let result = await axios.get(`${API_SERVER_URL}/excel-translators`, {
                headers: headers
            })
                .then(res => {
                    if (res?.status === 200) {
                        return {
                            message: 'success',
                            content: res.data?.content
                        };
                    }
                })
                .catch(err => {
                    console.log(err);
                    return {
                        message: err?.response?.data?.message,
                        content: null,
                    }
                })
            console.log(result);
            return result;
        });
    }
}

module.exports = {
    excelTranslatorIpcs: excelTranslatorIpcs
}