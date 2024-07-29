const { ipcMain } = require("electron");
const { default: axios } = require("axios");
const { customSignitureUtils } = require("../../../utils/customSignitureUtils");
const { customUrlUtils } = require('../../../utils/customUrlUtils');

// TODO : 임시 저장소에 저장 로직 완성하기
const temporaryErpItemsIpcs = {
    setting: (app, store) => {
        const ROOT_PATH = 'temporary-erp-items';
        const API_SERVER_URL = customUrlUtils.API_SERVER_URL;

        ipcMain.handle(`${ROOT_PATH}/createList`, async (event, arg) => {
            const apiKey = store.get('apiKey');
            const secretKey = store.get('secretKey');
            const timestamp = Date.now().toString();

            const signiture = customSignitureUtils.generateSigniture({ apiKey: apiKey, secretKey: secretKey, timestamp: timestamp });

            const headers = customSignitureUtils.makeHeaders({
                apiKey: apiKey, timestamp: timestamp, signiture: signiture
            })

            const body = {
                temporaryErpItemList: arg?.temporaryErpItemList
            }

            let result = await axios.post(`${API_SERVER_URL}/temporary-erp-items`, body, {
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
                        message: 'failure',
                        content: null
                    }
                })
        });
    }
}

module.exports = {
    temporaryErpItemsIpcs: temporaryErpItemsIpcs
}