const { initBrowser, initPage } = require("../../../globals/custom_puppeteer");
const { orderFormatListDoc } = require("../resources/orderFormatListDoc");
const { smartstoreServiceModule } = require("./smartstoreServiceModule");

const smartstoreService = {
    login: async (page, { username, password }) => {
        await delay(500);
        const linkSelector = 'button.btn-login';
        const linkElement = await page.$(linkSelector);

        await linkElement.hover();
        await delay(500);

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'load' }),
            linkElement.click(), // 링크 클릭
        ]);

        console.log('스마트스토어 로그인하기 버튼을 누름!');

        await delay(500);
        console.log('유저 로그인 정보 입력 시작')

        const loginIdInputSelector = 'input[placeholder="아이디 또는 이메일 주소"]';
        const loginPasswordInputSelector = 'input[placeholder="비밀번호"]';


        await page.waitForSelector(loginIdInputSelector);
        await page.waitForSelector(loginPasswordInputSelector);


        const loginInputElement = await page.$(loginIdInputSelector);
        const loginPasswordElement = await page.$(loginPasswordInputSelector);


        const loginId = username || '';
        const loginPassword = password || '';

        // 복붙 버전
        await loginInputElement.type(loginId);
        await loginPasswordElement.type(loginPassword);
        // 딜레이 버전
        // for (let i = 0; i < loginId?.length; i++) {
        //     await loginInputElement.type(loginId.charAt(i), { delay: 50 }); // { delay: 100 }은 입력 간의 시간 간격을 조절합니다.
        // }

        // for (let i = 0; i < loginPassword?.length; i++) {
        //     await loginPasswordElement.type(loginPassword.charAt(i), { delay: 50 }); // { delay: 100 }은 입력 간의 시간 간격을 조절합니다.
        // }

        console.log('유저 로그인 정보 입력 종료');

        await delay(500);
        console.log('유저 로그인 서밋 시작');

        const loginButtonSelector = 'button.Button_btn_plain__1j7dG';
        await page.waitForSelector(loginButtonSelector);
        const loginButtonElement = await page.$(loginButtonSelector);

        await loginButtonElement.click();

        const response = await Promise.race([
            page.waitForNavigation({ waitUntil: 'load' }).then(() => 'success'),
            page.waitForSelector('div.Login_error__mT0Ik').then(() => 'failure'),
        ])

        console.log('유저 로그인 서밋 종료');

        if (response === 'success') {
            await delay(500);
            console.log('발주 발송관리 페이지로 이동 시작');
            await page.goto(`https://sell.smartstore.naver.com/#/naverpay/sale/delivery`, { waitUntil: 'load' });
            await page.setViewport({ width: 1440, height: 1024 });

            console.log('발주 발송관리 페이지로 이동 종료');

            console.log('스토어 이동 모달창 열기 시작');

            await page.waitForSelector('a[data-action-location-id="selectStore"]');
            await page.evaluate(() => {
                document.querySelector('a[data-action-location-id="selectStore"]').click();
            });

            console.log('스토어 이동 모달창 열기 종료');

            await page.waitForSelector('div.modal-content');
            await page.waitForSelector('div.modal-content button.close');
            await page.waitForSelector('div.modal-content div.panel .search-area');

            await delay(1000);

            console.log('스토어들 가져오기 시작');
            const storeNameList = await page.evaluate(() => {
                const storeNameList = [];

                // 접속중인 스토어 추출
                const element = document.querySelector('div.modal-content div.panel .search-area .text-title');
                if (element) {
                    // 하위 요소의 텍스트를 제외한 텍스트만 추출
                    const clonedElement = element.cloneNode(true);
                    const labelElement = clonedElement.querySelector('span.label');
                    if (labelElement) {
                        clonedElement.removeChild(labelElement);
                    }

                    storeNameList.push(clonedElement.textContent.trim());
                }

                // 하위 스토어 리스트 추출
                const liList = document.querySelectorAll('div.modal-content div.panel .seller-list-border li');
                liList.forEach(li => {
                    const clonedElement = li.querySelector('.text-title').cloneNode(true);
                    const labelElement = clonedElement.querySelector('span.label');
                    if (labelElement) {
                        clonedElement.removeChild(labelElement);
                    }

                    storeNameList.push(clonedElement.textContent.trim());
                })

                return storeNameList;
            });

            console.log('스토어들 가져오기 종료');

            console.log('스토어 이동 모달창 닫기 시작');
            await page.evaluate(() => {
                const closeButton = document.querySelector('div.modal-content button.close');
                if (closeButton) {
                    closeButton.click();
                    console.log('button clicked')
                }
            })
            console.log('스토어 이동 모달창 닫기 종료');

            return {
                message: 'success',
                content: storeNameList
            }
        } else if (response === 'failure') {
            return {
                message: 'failure',
                content: null
            }
        }
    },
    searchOrderInformations: async (page, storeName, confirmNewOrderFlag) => {
        await moveStore(page, storeName);

        await delay(1000);

        if (confirmNewOrderFlag) {
            await smartstoreService.confirmNewOrder(page, storeName);
        }
        // 발주건 수집 전 신규주문 발주확인작업

        await delay(1000);

        return await Promise.all([
            // searchOrderData('NEW_ORDER'),
            searchOrderData('ORDER_CONFIRM'),
            searchOrderData('SEND_DELAY'),
            searchOrderData('SEND_CANCEL'),
            searchOrderData('SEND_ADDRESS'),
        ])
    },
    confirmNewOrder: async (page, storeName) => {
        page.on('dialog', async dialog => {
            console.log(dialog.type());
            console.log(dialog.message());
            if (dialog.type() === 'confirm') {
                await dialog.accept();
            } else if (dialog.type() === 'alert') {
                await dialog.accept();
            } else {
                await dialog.dismiss();
            }
        });

        console.log('smartstoreServiceModule.getIframe 시작')
        const iframe = await smartstoreServiceModule.getIframe(page);
        console.log('NEXT');

        console.log('smartstoreServiceModule.changeOrderStatus 시작')
        await smartstoreServiceModule.changeOrderStatus(iframe, 'NEW_ORDER');
        console.log('NEXT');

        console.log('smartstoreServiceModule.waitForTableLoading 시작')
        await smartstoreServiceModule.waitForTableLoading(iframe);
        console.log('NEXT');

        console.log('smartstoreServiceModule.checkAllOrderDataList 시작')
        const checkAllResponse = await smartstoreServiceModule.checkAllOrderDataList(iframe); // none or success
        console.log('NEXT');

        // checkAllResponse가 success 면 신규주문에 주문건이 있어서 모든 항목에 대한 체크를 해서 발주확인 버튼을 클릭 할 수 있는 상태임.
        // none 이면 신규주문에 주문건이 없어서 발주확인을 하지 못하는 상태임.
        if (checkAllResponse === 'success') {
            console.log('smartstoreServiceModule.confirmOrder 시작')
            await smartstoreServiceModule.confirmOrder(iframe);
            console.log('NEXT');
        }
        // console.log(inputClickResponse);
    }
}

async function searchOrderData(orderStatus) {
    const browser = await initBrowser();

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1024 });
    await page.goto('https://sell.smartstore.naver.com/#/naverpay/sale/delivery');

    const iframe = await getIframe(page);

    switch (orderStatus) {
        case 'NEW_ORDER':
            await changeOrderStatus(iframe, '.ico_new_order');
            break;
        case 'ORDER_CONFIRM':
            await changeOrderStatus(iframe, '.ico_order_confirm');
            break;
        case 'SEND_DELAY':
            await changeOrderStatus(iframe, '.ico_send_delay');
            break;
        case 'SEND_CANCEL':
            await changeOrderStatus(iframe, '.ico_send_cancel');
            break;
        case 'SEND_ADDRESS':
            await changeOrderStatus(iframe, '.ico_send_address');
            break;
    }

    await delay(1000);

    await selectView500(iframe);
    const contentList = await extractOrderDatas(iframe, orderStatus);

    await page.close();
    return contentList;
}

async function moveStore(page, storeName) {
    console.log('스토어 이동 모달창 열기 시작');

    await page.waitForSelector('a[data-action-location-id="selectStore"]');
    await page.evaluate(() => {
        document.querySelector('a[data-action-location-id="selectStore"]').click();
    });

    console.log('스토어 이동 모달창 열기 종료');

    await delay(1000);
    console.log('스토어 이동 시작');

    await page.waitForSelector('div.modal-content div.panel .search-area');

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

async function changeOrderStatus(iframe, buttonSelector) {
    console.log('발주상태 이동 시작');
    await iframe.waitForSelector(buttonSelector);

    const buttonElement = await iframe.$(buttonSelector);

    await buttonElement.evaluate((button) => {
        button.click();
    });

    console.log('발주상태 이동 종료');
}

async function getIframe(page) {
    console.log('iframe 접근 시작');

    await delay(2000);
    const iframeHandle = await page.waitForSelector('#__delegate');
    const iframe = await iframeHandle.contentFrame();

    console.log('iframe 접근 종료');

    return iframe;
}

async function selectView500(iframe) {
    console.log('500개씩 보기 선택 시작');
    await iframe.waitForSelector('div.npay_section div.npay_sub_heading select');
    await iframe.evaluate(() => {
        const selectElement = document.querySelectorAll('div.npay_section div.npay_sub_heading select')[1];

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
}

async function extractOrderDatas(iframe, orderStatus) {
    console.log('발주 데이터 추출 시작');

    const orderFormatList = orderFormatListDoc;

    // 주문 필드의 그리드 고정 부분의 데이터를 가져온다.
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
                            form[orderFormat?.fieldName] = productOrderNoTd.innerText?.trim()
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

    // 주문 필드의 나머지 데이터를 가져온다.
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
                            form[orderFormat?.fieldName] = productOrderNoTd.innerText?.trim()
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

    // 초기 주문 형식 설정.
    const originDataForm = orderFormatList?.reduce((acc, current) => {
        acc[current.fieldName] = '';
        return acc;
    }, {});

    const result = leftSideDataList?.map((leftSideData, leftSideIndex) => {
        return {
            ...originDataForm,
            ...leftSideData,
            ...rightSideDataList[leftSideIndex]
        }
    })
    console.log('발주 데이터 추출 종료');
    return {
        orderStatus: orderStatus,
        orderDataList: result
    };
}

async function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

module.exports = {
    smartstoreService
}