const puppeteer = require('puppeteer');

let browser;
let page;

async function initBrowser() {
    if (browser) {
        console.log('기존 브라우저를 이용함.');
        return browser;
    }

    browser = await puppeteer.launch({ headless: false });
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