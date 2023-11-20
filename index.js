import puppeteer from "puppeteer";

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(
    "https://www.ccma.cat/3cat/lexili-i-el-retorn-de-teresa-pamies/audio/1187849/"
  );

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // Wait and click on first result
  const titleSelector = ".itemaudio_titol__leaYf";
  const titleNode = await page.waitForSelector(titleSelector);

  const fullTitle = await titleNode?.evaluate((el) => el.textContent);

  // Print the full title
  console.log("iep");
  console.log(fullTitle);

  await browser.close();
})();
