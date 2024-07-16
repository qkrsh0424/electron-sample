const puppeteer = require('puppeteer');

let browser;
let page;

let chromeExecutablePath;
if (process.platform === 'win32' || process.platform === 'win64') {
    chromeExecutablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
} else if (process.platform === 'darwin') {
    chromeExecutablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
} else if (process.platform === 'linux') {
    chromeExecutablePath = '/usr/bin/google-chrome';
}

async function initBrowser() {
    if (browser) {
        console.log('기존 브라우저를 이용함.');
        return browser;
    }

    browser = await puppeteer.launch({
        executablePath: chromeExecutablePath,
        headless: false
    });
    console.log('새로운 브라우저가 생성됨.');

    return browser;
}


async function initPage() {
    if (page) {
        console.log('기존 페이지를 이용함.');
        return page;
    }

    const browser = await initBrowser();
    page = await browser.newPage();

    console.log('새로운 페이지가 생성됨.');

    return page;
}

async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
        console.log('브라우저가 닫힘.');
    }
}

async function closePage() {
    if (page) {
        await page.close();
        page = null;
        console.log('페이지가 닫힘.');
    }
}

module.exports = {
    initBrowser,
    initPage,
    closeBrowser,
    closePage
}