const { initPage } = require("../../../globals/custom_puppeteer");
const { customDateUtils } = require("../../../utils/customDateUtils");
const { customPathUtils } = require("../../../utils/customPathUtils");
const path = require('path');

const screenshotService = {
    screenshot: async (staticPath) => {
        const page = await initPage();
        if (!staticPath) {
            await page.screenshot({ path: path.join(customPathUtils.getRoot(), '/src', '/screenshots', `/screenshot_${customDateUtils.getYYYYMMDDhhmmssZZZ()}.png`) });
            return;
        }
        await page.screenshot({ path: staticPath });
    }
}

module.exports = {
    screenshotService
}