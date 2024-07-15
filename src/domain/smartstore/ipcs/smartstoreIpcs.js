const { ipcMain } = require("electron");
const path = require('path');
const { initBrowser, initPage, closePage, closeBrowser } = require("../../../globals/custom_puppeteer");
const { customPathUtils } = require("../../../utils/customPathUtils");
const { screenshotService } = require("../../screenshot/service/screenshotService");
const { smartstoreService } = require("../service/smartstoreService");
const ExcelJS = require('exceljs');
const { orderFormatListDoc } = require("../resources/orderFormatListDoc");
const { smartstoreServiceModule } = require("../service/smartstoreServiceModule");

const ROOT_PATH = 'smartstore';

const smartstoreIpcs = {
    setting: (app) => {
        ipcMain.handle(`${ROOT_PATH}/login`, async (event, arg) => {
            const browser = await initBrowser();
            const page = await browser.newPage();

            await page.goto(`https://sell.smartstore.naver.com`);
            await page.setViewport({ width: 1440, height: 1024 });
            await page.waitForSelector('.btn-login');

            const message = await smartstoreService.login(page, {
                username: arg?.username,
                password: arg?.password
            })
            await page.close();
            return message;
        });

        ipcMain.handle(`${ROOT_PATH}/connect`, async (event, arg) => {
            const browser = await initBrowser();
            const page = await initPage();

            await page.goto(`https://sell.smartstore.naver.com`);
            await page.setViewport({ width: 1440, height: 1024 });
            await page.waitForSelector('.btn-login');

            return await smartstoreService.login({
                username: arg?.username,
                password: arg?.password
            })
        });

        ipcMain.handle(`${ROOT_PATH}/disconnect`, async (event, arg) => {
            const browser = await initBrowser();
            const page = await initPage();

            await closePage();
            await closeBrowser();
            return {
                message: 'success',
                content: null
            }
        });

        ipcMain.handle(`${ROOT_PATH}/search`, async (event, arg) => {
            const browser = await initBrowser();
            const page = await smartstoreServiceModule.createNewPage(browser);

            try {
                console.log('smartstoreServiceModule.gotoUrl 시작')
                await smartstoreServiceModule.gotoUrl(page, 'https://sell.smartstore.naver.com/#/naverpay/sale/delivery');
            } catch (err) {
                console.log(err);
                return {
                    message: 'failure',
                    content: null
                }
            }

            let result = [];

            for (let i = 0; i < arg?.storeNameList?.length; i++) {
                const storeName = arg?.storeNameList[i];
                result.push({
                    storeName: storeName,
                    content: await smartstoreService.searchOrderInformations(page, storeName)
                })
            }

            await page.close();
            return {
                message: 'success',
                content: result
            }
        });

        ipcMain.handle(`${ROOT_PATH}/confirm-newOrder`, async (event, arg) => {
            const storeName = arg?.storeNameList[0];
            return await smartstoreService.confirmNewOrder(storeName);
        })

        ipcMain.handle(`${ROOT_PATH}/generate-excel`, async (event, arg) => {
            try {
                // 엑셀 파일 경로
                const excelFilePath = path.join(customPathUtils.getRoot(), 'src/lib/sample-excels/orderExcelSample.xlsx');
                // 엑셀 파일 읽기
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.readFile(excelFilePath);
                const worksheet = workbook.getWorksheet(1); // 첫 번째 시트

                const orderFormatList = orderFormatListDoc;

                const data = arg.data?.map(orderData => {
                    return orderFormatList.map(orderFormat => {
                        return orderData[orderFormat.fieldName];
                    })
                })

                // 데이터를 2행부터 추가
                data.forEach((row, rowIndex) => {
                    const excelRow = worksheet.getRow(rowIndex + 2); // 2행부터 시작
                    row.forEach((cell, colIndex) => {
                        const excelCell = excelRow.getCell(colIndex + 1); // 1열부터 시작
                        excelCell.value = cell;
                    });
                    excelRow.commit(); // 행을 커밋하여 변경 사항을 적용
                });

                // 엑셀 파일을 Buffer 형식으로 변환
                const buffer = await workbook.xlsx.writeBuffer();
                return buffer.toString('base64');
            } catch (error) {
                throw new Error('엑셀 파일 생성 에러: ' + error.message);
            }
        });

        ipcMain.handle(`${ROOT_PATH}/get-orderFormatList`, async (event, arg) => {
            const result = orderFormatListDoc;

            return {
                message: 'success',
                content: result
            }
        });

        ipcMain.handle(`${ROOT_PATH}/goto`, async (event, arg) => {
            const browser = await initBrowser();
            const page = await initPage();

            await page.goto(`https://sell.smartstore.naver.com`);
            await page.setViewport({ width: 1440, height: 1024 });
            await page.waitForSelector('.btn-login');
            await screenshotService.screenshot(path.join(customPathUtils.getRoot(), '/src', '/screenshots', `/browserAndPageOpened.png`));

            await startPageLoginButtonClick();
            await inputUserLoginInfo();
            await submitUserLogin();
            await gotoDeliveryPage();
            await moveStoreModalOpen();
            await moveStore('니뜰리히');

            let iframe = await getIframe();
            iframe = await moveToOrderConfirm(iframe);
            iframe = await selectView500(iframe);

            const orderList = await extractOrderDatas(iframe);

            console.log(orderList?.length)
            await screenshotService.screenshot();
            return '페이지 열림.';
        });
    }
}

async function startPageLoginButtonClick() {
    await delay(500);
    const browser = await initBrowser();
    const page = await initPage();

    const linkSelector = 'button.btn-login';
    const linkElement = await page.$(linkSelector);

    await linkElement.hover();
    await delay(500);

    await Promise.all([
        page.waitForNavigation({ waitUntil: 'load' }),
        linkElement.click(), // 링크 클릭
    ]);

    console.log('스마트스토어 로그인하기 버튼을 누름!');
}

async function inputUserLoginInfo(username, password) {
    await delay(500);
    console.log('유저 로그인 정보 입력 시작')
    const browser = await initBrowser();
    const page = await initPage();

    const loginIdInputSelector = 'input[placeholder="아이디 또는 이메일 주소"]';
    const loginPasswordInputSelector = 'input[placeholder="비밀번호"]';


    await page.waitForSelector(loginIdInputSelector);
    await page.waitForSelector(loginPasswordInputSelector);


    const loginInputElement = await page.$(loginIdInputSelector);
    const loginPasswordElement = await page.$(loginPasswordInputSelector);


    const loginId = 'piaar.purchasing@gmail.com';
    const loginPassword = 'Nsyna134!';

    for (let i = 0; i < loginId?.length; i++) {
        await loginInputElement.type(loginId.charAt(i), { delay: 50 }); // { delay: 100 }은 입력 간의 시간 간격을 조절합니다.
    }

    for (let i = 0; i < loginPassword?.length; i++) {
        await loginPasswordElement.type(loginPassword.charAt(i), { delay: 50 }); // { delay: 100 }은 입력 간의 시간 간격을 조절합니다.
    }

    console.log('유저 로그인 정보 입력 종료')
}

async function submitUserLogin() {
    await delay(500);
    console.log('유저 로그인 서밋 시작');
    const browser = await initBrowser();
    const page = await initPage();

    const loginButtonSelector = 'button.Button_btn_plain__1j7dG';
    await page.waitForSelector(loginButtonSelector);
    const loginButtonElement = await page.$(loginButtonSelector);

    await Promise.all([
        page.waitForNavigation({ waitUntil: 'load' }),
        loginButtonElement.click()
    ]);
    console.log('유저 로그인 서밋 종료');
}

async function gotoDeliveryPage() {
    await delay(500);
    console.log('발주 발송관리 페이지로 이동 시작');
    const browser = await initBrowser();
    const page = await initPage();

    await page.goto(`https://sell.smartstore.naver.com/#/naverpay/sale/delivery`);
    await page.setViewport({ width: 1440, height: 1024 });

    console.log('발주 발송관리 페이지로 이동 종료');
}

async function moveStoreModalOpen() {
    await delay(500);
    console.log('스토어 이동 모달창 열기 시작');
    const browser = await initBrowser();
    const page = await initPage();

    await page.waitForSelector('a[data-action-location-id="selectStore"]');
    await page.evaluate(() => {
        document.querySelector('a[data-action-location-id="selectStore"]').click();
    });

    console.log('스토어 이동 모달창 열기 종료');
}

async function moveStore(storeName) {
    await delay(2000);
    console.log('스토어 이동 시작');
    const browser = await initBrowser();
    const page = await initPage();

    await page.waitForSelector('span.text-title');
    await page.evaluate((storeName) => {
        const elements = document.querySelectorAll('span.text-title');
        for (const element of elements) {
            if (element.textContent.includes(storeName)) {
                element.click();
                break;  // 첫 번째 요소만 찾으면 되므로 반복문 중단
            }
        }
    }, storeName); // storeName을 page.evaluate() 함수에 전달
    console.log('스토어 이동 종료');
}

async function getIframe() {
    await delay(500);
    console.log('iframe 접근 시작');
    const browser = await initBrowser();
    const page = await initPage();

    await delay(2000);
    const iframeHandle = await page.waitForSelector('#__delegate');
    const iframe = await iframeHandle.contentFrame();

    console.log('iframe 접근 종료');

    return iframe;
}

async function moveToOrderConfirm(iframe) {
    console.log('발주확인 이동 시작');
    const buttonSelector = '.ico_order_confirm';
    await iframe.waitForSelector(buttonSelector);

    const buttonElement = await iframe.$(buttonSelector);

    await buttonElement.evaluate((button) => {
        button.click();
    });

    console.log('발주확인 이동 종료');
    return iframe;
}

async function selectView500(iframe) {
    console.log('500개씩 보기 선택 시작');
    const selectSelector = 'select._M6mh89w8y8';

    await delay(2000);
    await iframe.evaluate(() => {
        // document.querySelectorAll('select._M6mh89w8y8')[9]를 사용하여 9번째 select 요소를 가져옵니다.
        const selectElement = document.querySelectorAll('select._M6mh89w8y8')[9];

        // select 요소의 값을 '500'으로 변경합니다.
        selectElement.value = '500';

        // 이벤트를 수동으로 발생시켜 변경된 값이 반영되도록 합니다.
        const changeEvent = new Event('change', { bubbles: true });
        selectElement.dispatchEvent(changeEvent);
    });
    await delay(500);
    await iframe.waitForFunction(() => {
        const element = document.querySelector('div._F570takBRd');
        if (element) {
            const displayStyle = window.getComputedStyle(element).getPropertyValue('display');
            return displayStyle === 'none';
        }
        return false;
    });
    console.log('500개씩 보기 선택 종료');
    return iframe;
}

async function extractOrderDatas(iframe) {
    console.log('발주 데이터 추출 시작');
    const orderFormatList = [
        {
            fieldName: 'productOrderNo',
            isExtract: true,
        },
        {
            fieldName: 'orderNo',
            isExtract: true,
        },
        {
            fieldName: 'deliveryAttributeText',
            isExtract: false,
        },
        {
            fieldName: 'fulfillmentCompanyName',
            isExtract: false,
        },
        {
            fieldName: 'deliveryMethodPay',
            isExtract: true,
        },
        {
            fieldName: 'deliveryMethod',
            isExtract: false,
        },
        {
            fieldName: 'deliveryCompanyCode',
            isExtract: false,
        },
        {
            fieldName: 'deliveryInvoiceNo',
            isExtract: false,
        },
        {
            fieldName: 'deliveryDateTime',
            isExtract: true,
        },
        {
            fieldName: 'saleChannelType',
            isExtract: true,
        },
        {
            fieldName: 'orderMemberName',
            isExtract: true,
        },
        {
            fieldName: 'orderMemberId',
            isExtract: true,
        },
        {
            fieldName: 'receiverName',
            isExtract: true,
        },
        {
            fieldName: 'orderStatus',
            isExtract: true,
        },
        {
            fieldName: 'productOrderStatus',
            isExtract: true,
        },
        {
            fieldName: 'payLocationType',
            isExtract: true,
        },
        {
            fieldName: 'payDateTime',
            isExtract: true,
        },
        {
            fieldName: 'productNo',
            isExtract: true,
        },
        {
            fieldName: 'productName',
            isExtract: true,
        },
        {
            fieldName: 'productClass',
            isExtract: true,
        },
        {
            fieldName: 'returnCareTarget',
            isExtract: true,
        },
        {
            fieldName: 'productOptionContents',
            isExtract: true,
        },
        {
            fieldName: 'sellerOptionManagementCode',
            isExtract: true,
        },
        {
            fieldName: 'orderQuantity',
            isExtract: true,
        },
        {
            fieldName: 'productOptionAmt',
            isExtract: true,
        },
        {
            fieldName: 'productUnitPrice',
            isExtract: true,
        },
        {
            fieldName: 'totalDiscountAmt',
            isExtract: true,
        },
        {
            fieldName: 'sellerDiscountAmt',
            isExtract: true,
        },
        {
            fieldName: 'productPayAmt',
            isExtract: true,
        },
        {
            fieldName: 'giftName',
            isExtract: true,
        },
        {
            fieldName: 'placingOrderDateTime',
            isExtract: true,
        },
        {
            fieldName: 'dispatchDueDateTime',
            isExtract: true,
        },
        {
            fieldName: 'dispatchDateTime',
            isExtract: true,
        },
        {
            fieldName: 'waybillPrintDateTime',
            isExtract: true,
        },
        {
            fieldName: 'deliveryFeeRatingClass',
            isExtract: true,
        },
        {
            fieldName: 'deliveryBundleGroupSeq',
            isExtract: true,
        },
        {
            fieldName: 'deliveryFeeClass',
            isExtract: true,
        },
        {
            fieldName: 'deliveryFeeAmt',
            isExtract: true,
        },
        {
            fieldName: 'remoteAreaCostChargeAmt',
            isExtract: true,
        },
        {
            fieldName: 'deliveryFeeDiscountAmt',
            isExtract: true,
        },
        {
            fieldName: 'sellerProductManagementCode',
            isExtract: true,
        },
        {
            fieldName: 'sellerInternalCode1',
            isExtract: true,
        },
        {
            fieldName: 'sellerInternalCode2',
            isExtract: true,
        },
        {
            fieldName: 'receiverTelNo1',
            isExtract: true,
        },
        {
            fieldName: 'receiverTelNo2',
            isExtract: true,
        },
        {
            fieldName: 'receiverIntegratedAddress',
            isExtract: true,
        },
        {
            fieldName: 'receiverDisplayBaseAddress',
            isExtract: true,
        },
        {
            fieldName: 'receiverDisplayDetailAddress',
            isExtract: true,
        },
        {
            fieldName: 'orderMemberTelNo',
            isExtract: true,
        },
        {
            fieldName: 'receiverZipCode',
            isExtract: true,
        },
        {
            fieldName: 'productOrderMemo',
            isExtract: true,
        },
        {
            fieldName: 'takingGoodsPlaceAddress',
            isExtract: true,
        },
        {
            fieldName: 'payMeansClass',
            isExtract: true,
        },
        {
            fieldName: 'commissionClassType',
            isExtract: true,
        },
        {
            fieldName: 'salesCommissionPrepay',
            isExtract: true,
        },
        {
            fieldName: 'payCommissionAmt',
            isExtract: true,
        },
        {
            fieldName: 'knowledgeShoppingCommissionAmt',
            isExtract: true,
        },
        {
            fieldName: 'settlementExpectAmt',
            isExtract: true,
        },
        {
            fieldName: 'sellingInterlockCommissionInflowPath',
            isExtract: true,
        },
        {
            fieldName: 'individualCustomUniqueCode',
            isExtract: true,
        },
        {
            fieldName: 'orderDateTime',
            isExtract: true,
        },
        {
            fieldName: 'subscriptionPeriodCount',
            isExtract: true,
        },
        {
            fieldName: 'subscriptionRound',
            isExtract: true,
        },
        {
            fieldName: 'hopeDelivery',
            isExtract: true,
        },
    ];

    const leftSideDataList = await iframe.$$eval(
        'div.tui-grid-lside-area div.tui-grid-body-area table tbody tr',
        (rows, orderFormatList) => {
            const orderList = [];

            rows.forEach(row => {
                let form = {};

                orderFormatList?.forEach(orderFormat => {
                    const productOrderNoTd = row.querySelector(`td[data-column-name="${orderFormat?.fieldName}"]`);

                    if (productOrderNoTd) {
                        if (orderFormat.isExtract) {
                            form[orderFormat?.fieldName] = productOrderNoTd.innerText
                        } else {
                            form[orderFormat?.fieldName] = '';
                        }
                    }
                });

                orderList.push(form);
            });

            return orderList;
        },
        orderFormatList
    );

    const rightSideDataList = await iframe.$$eval(
        'div.tui-grid-rside-area div.tui-grid-body-area table tbody tr',
        (rows, orderFormatList) => {
            const orderList = [];

            rows.forEach(row => {
                let form = {};

                orderFormatList?.forEach(orderFormat => {
                    const productOrderNoTd = row.querySelector(`td[data-column-name="${orderFormat?.fieldName}"]`);

                    if (productOrderNoTd) {
                        if (orderFormat.isExtract) {
                            form[orderFormat?.fieldName] = productOrderNoTd.innerText
                        } else {
                            form[orderFormat?.fieldName] = '';
                        }
                    }
                });

                orderList.push(form);
            });

            return orderList;
        },
        orderFormatList
    );

    const result = leftSideDataList?.map((leftSideData, leftSideIndex) => {
        return {
            ...leftSideData,
            ...rightSideDataList[leftSideIndex]
        }
    })
    console.log(result);
    console.log('발주 데이터 추출 종료');
    return result;
}

async function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

async function getAttributes(element) {
    const page = await initPage();

    const attributes = await page.evaluate(el => {
        const attrs = {};
        for (let attr of el.attributes) {
            attrs[attr.name] = attr.value;
        }
        return attrs;
    }, element);

    console.log('Attributes:', attributes);
}

module.exports = {
    smartstoreIpcs
}