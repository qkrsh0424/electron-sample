const { ipcMain } = require("electron");
const { screenshotService } = require("../service/screenshotService");

const ROOT_PATH = 'screenshot';

const screenshotIpcs = {
    setting: () => {
        ipcMain.handle(`${ROOT_PATH}/run`, async (event, arg) => {
            await screenshotService.screenshot();
            return '스크린샷 찍음';
        });
    }
}

module.exports = {
    screenshotIpcs
}