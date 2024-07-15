const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const puppeteer = require('puppeteer');
// const isDev = require('electron-is-dev');

const isDev = !app.isPackaged;

console.log(__dirname);
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        // mainWindow.loadFile(path.join(__dirname, '../index.html'));
    } else {
        mainWindow.loadFile(path.join(__dirname, '../client/build/index.html'));
    }

    // Open DevTools if in development mode
    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }

}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('test', async (event, arg) => {
    const browser = await puppeteer.launch();
    let page = await browser.newPage();

    try {

        const result = await naverMainPage(page);
        page = await naverResultPage(page, browser);
        page = await smartstoreLogin(page, browser);
        page = await selectStore(page, browser);

        return `${result} 스크래핑 완료`;
    } catch (err) {
        return 'Error';
    } finally {
        await page.close();
        await browser.close();
    }
})

async function naverMainPage(page) {
    console.log('네이버 메인 페이지 열림!');
    // 페이지 로드
    await page.goto('https://www.naver.com/');
    await page.setViewport({ width: 1440, height: 1024 });
    await page.screenshot({ path: path.join(__dirname, 'screenshots', `/mainPage/pageLoaded.png`) });

    // input 요소 선택
    const inputSelector = 'div.search_input_box input.search_input';
    const inputElement = await page.$(inputSelector);

    // 텍스트 입력
    const text = '스마트스토어';

    if (!inputElement) {
        console.error('input 요소를 찾을 수 없습니다.');
        return 'undefined inputElement error';
    }

    for (let i = 0; i < text.length; i++) {
        await inputElement.type(text.charAt(i), { delay: 50 }); // { delay: 100 }은 입력 간의 시간 간격을 조절합니다.
    }

    const searchButtonSelector = 'button.btn_search';
    const searchButtonElement = await page.$(searchButtonSelector);

    await Promise.all([
        page.waitForNavigation({ waitUntil: 'load' }), // 'load', 'domcontentloaded', 'networkidle0', 'networkidle2' 중 선택
        searchButtonElement.click(), // 실제 버튼의 선택자로 변경
    ]);

    await page.screenshot({ path: path.join(__dirname, 'screenshots', `/mainPage/complete.png`) });
    console.log('네이버 검색창에 스마트스토어를 검색함!');

    return await page.title();
}

async function naverResultPage(page, browser) {
    console.log('스마트스토어 링크를 찾는중!');
    await delay(300);

    const linkSelector = 'div.api_subject_bx a.link_name';
    const linkElement = await page.$(linkSelector);

    await linkElement.hover();
    await page.screenshot({ path: path.join(__dirname, 'screenshots', `/resultPage/linkHover.png`) });
    await delay(200);

    const [newPage] = await Promise.all([
        new Promise(resolve => browser.once('targetcreated', target => resolve(target.page()))),
        linkElement.click(), // 링크 클릭
    ]);

    // 새 페이지가 열리기를 기다림
    await newPage.waitForSelector('button.btn-login');
    await newPage.setViewport({ width: 1440, height: 1024 });
    await newPage.screenshot({ path: path.join(__dirname, 'screenshots', `/resultPage/linkClicked.png`) });

    console.log('스마트스토어 링크가 클릭됨!');
    return newPage;
}

async function smartstoreLogin(page, browser) {
    console.log('스마트스토어 로그인 페이지가 열림!');
    await delay(300);
    const linkSelector = 'button.btn-login';
    const linkElement = await page.$(linkSelector);

    await linkElement.hover();
    await page.screenshot({ path: path.join(__dirname, 'screenshots', `/smartstoreLogin/linkHover.png`) });
    await delay(200);

    await Promise.all([
        page.waitForNavigation({ waitUntil: 'load' }),
        linkElement.click(), // 링크 클릭
    ]);

    console.log('스마트스토어 로그인하기 버튼을 누름!');

    const loginIdInputSelector = 'input[placeholder="아이디 또는 이메일 주소"]';
    const loginPasswordInputSelector = 'input[placeholder="비밀번호"]';
    const loginButtonSelector = 'button.Button_btn_plain__1j7dG';

    // 새 페이지가 열리기를 기다림
    await page.waitForSelector(loginIdInputSelector);
    await page.waitForSelector(loginPasswordInputSelector);
    await page.waitForSelector(loginButtonSelector);
    await page.setViewport({ width: 1440, height: 1024 });
    await page.screenshot({ path: path.join(__dirname, 'screenshots', `/smartstoreLogin/loginPageOpened.png`) });


    const loginInputElement = await page.$(loginIdInputSelector);
    const loginPasswordElement = await page.$(loginPasswordInputSelector);
    const loginButtonElement = await page.$(loginButtonSelector);

    const loginId = 'piaar.purchasing@gmail.com';
    const loginPassword = 'Nsyna134!';

    for (let i = 0; i < loginId?.length; i++) {
        await loginInputElement.type(loginId.charAt(i), { delay: 50 }); // { delay: 100 }은 입력 간의 시간 간격을 조절합니다.
    }

    for (let i = 0; i < loginPassword?.length; i++) {
        await loginPasswordElement.type(loginPassword.charAt(i), { delay: 50 }); // { delay: 100 }은 입력 간의 시간 간격을 조절합니다.
    }

    await page.screenshot({ path: path.join(__dirname, 'screenshots', `/smartstoreLogin/inputComplete.png`) });
    console.log('로그인 아이디 비밀번호가 입력됨!');


    await Promise.all([
        page.waitForNavigation({ waitUntil: 'load' }),
        loginButtonElement.click()
    ]);

    await page.screenshot({ path: path.join(__dirname, 'screenshots', `/smartstoreLogin/storeMainPage.png`) });
    console.log('로그인 됨!');
    return page;
}

async function selectStore(page, browser) {
    console.log('스마트스토어 관리자 페이지 로딩!');
    await delay(300);

    const storeChangeSelector = 'a[data-action-location-id="selectStore"]';

    await page.waitForSelector(storeChangeSelector);
    await delay(2000);
    await page.screenshot({ path: path.join(__dirname, 'screenshots', `/smartstoreConsole/pageLoaded.png`) });
    console.log('스마트스토어 관리자 페이지 로딩 완료됨!');
    return page;
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}