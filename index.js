import puppeteer from "puppeteer";

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: false });
  // false, slowMo: 100 });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(
    //"https://www.ccma.cat/3cat/lexili-i-el-retorn-de-teresa-pamies/audio/1187849/"
    "https://www.ccma.cat/3cat/en-guardia/audio/963141/"
  );

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // Click play button
  const buttonSelector = ".jw-icon-playback";
  const cookiesSelector = "#didomi-notice-agree-button";
  const signupSelector = ".onboarding_botoTanca__bpmHW";

  await page.waitForSelector(cookiesSelector);
  await page.click(cookiesSelector);

  await page.waitForSelector(signupSelector);
  await page.click(signupSelector);

  await page.waitForSelector(buttonSelector);
  await page.click(buttonSelector);

  // Read title
  const titleSelector = ".itemaudio_titol__leaYf";
  const titleNode = await page.waitForSelector(titleSelector);
  const fullTitle = await titleNode?.evaluate((el) => el.textContent);
  console.log(fullTitle);

  // Read audio source
  const audioSelector = "video";
  const audioNode = await page.waitForSelector(audioSelector);
  const audioSource = await audioNode?.evaluate((el) => el.getAttribute("src"));
  console.log(audioSource);

  await browser.close();
})();
