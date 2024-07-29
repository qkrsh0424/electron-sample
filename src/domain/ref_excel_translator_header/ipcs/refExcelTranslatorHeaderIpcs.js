const { ipcMain } = require("electron");
const { default: axios } = require("axios");
const { customSignitureUtils } = require("../../../utils/customSignitureUtils");
const { customUrlUtils } = require('../../../utils/customUrlUtils');

const refExcelTranslatorHeaderIpcs = {
    setting: (app, store) => {
        const ROOT_PATH = 'ref-excel-translator-headers';
        const API_SERVER_URL = customUrlUtils.API_SERVER_URL;

        ipcMain.handle(`${ROOT_PATH}/searchDefault`, async (event, arg) => {
            let result = await axios.get(`${API_SERVER_URL}/ref-excel-translator-headers/getDefault`)
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
                        message: 'failure',
                        content: null
                    }
                })
            return result;
        });
    }
}

module.exports = {
    refExcelTranslatorHeaderIpcs: refExcelTranslatorHeaderIpcs
}