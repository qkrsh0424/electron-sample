const smartstoreServiceModule = {
    createNewPage: async (browser) => {
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 1024 });
        return page;
    },
    gotoUrl: async (page, url) => {

        await page.goto(url, { waitUtil: 'networkidle2' });
        await delay(2000);
        if (page.url() !== url) {
            throw new Error('타겟 페이지를 로드 할 수 없습니다.');
        }
    },
    moveStore: async (page, storeName) => {
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
        }, storeName) // storeName을 page.evaluate() 함수에 전달
        console.log('스토어 이동 종료');
    },
    getIframe: async (page) => {
        console.log('iframe 접근 시작');

        await delay(2000);
        const iframeHandle = await page.waitForSelector('#__delegate');
        const iframe = await iframeHandle.contentFrame();

        console.log('iframe 접근 종료');

        return iframe;
    },
    changeOrderStatus: async (iframe, toOrderStatus) => {
        let buttonSelector = '.ico_new_order';
        switch (toOrderStatus) {
            case 'NEW_ORDER':
                buttonSelector = '.ico_new_order';
                break;
            case 'ORDER_CONFIRM':
                buttonSelector = '.ico_order_confirm';
                break;
            case 'SEND_DELAY':
                buttonSelector = '.ico_send_delay';
                break;
        }

        console.log('발주상태 이동 시작');
        await iframe.waitForSelector(buttonSelector);

        const buttonElement = await iframe.$(buttonSelector);

        await buttonElement.evaluate((button) => {
            button.click();
        });

        console.log('발주상태 이동 종료');
    },
    waitForTableLoading: async (iframe) => {
        await delay(1000);
        await iframe.waitForSelector('div._F570takBRd');
        await iframe.waitForFunction(() => {
            const element = document.querySelector('div._F570takBRd');
            if (element) {
                const displayStyle = window.getComputedStyle(element).getPropertyValue('display');
                return displayStyle === 'none';
            }
            return false;
        });
    },
    checkAllOrderDataList: async (iframe) => {
        await iframe.waitForSelector('div.tui-grid-lside-area th input[type="checkbox"]');

        // 요소의 'disabled' 속성을 확인하고, 필요 시 'null'을 반환
        const inputClickResponse = await iframe.evaluate(() => {
            
            // TEST: 첫번째 항목 선택
            // const checkboxElements = document.querySelectorAll('div.tui-grid-lside-area td input[type="checkbox"]');
            // const checkbox = checkboxElements[0];
            
            const checkbox = document.querySelector('div.tui-grid-lside-area th input[type="checkbox"]');

            if (!checkbox || checkbox.disabled) {
                return 'none';
            } else {
                checkbox.click();
                return 'success'; // 예시로 다른 값을 반환
            }
        });

        return inputClickResponse;
    },
    confirmOrder: async (iframe) => {
        await iframe.waitForFunction(() => {
            const element = document.querySelector('div._ozatGXI29C button');
            return element !== null;
        });

        await iframe.evaluate(() => {
            const elements = document.querySelectorAll('div._ozatGXI29C button');
            const confirmOrderButtonElement = elements[0];
            if (confirmOrderButtonElement) {
                confirmOrderButtonElement.click();
            }
        })
    }
}

async function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

module.exports = {
    smartstoreServiceModule
}