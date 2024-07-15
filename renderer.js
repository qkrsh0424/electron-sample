const { remote } = require('electron');
const puppeteer = require('puppeteer');

document.getElementById('scrapeButton').addEventListener('click', async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.google.com');

  // 여기서부터 원하는 스크래핑 로직을 작성
  const pageTitle = await page.title();
  console.log('페이지 제목:', pageTitle);

  await browser.close();
});
