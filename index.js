import fs from "fs";
import RSS from "rss";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const scrapeData = async (urls) => {
  const allResults = [];

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: "new" });
  /*   const browser = await puppeteer.launch({
    executablePath: "/usr/lib/chromium/chromium",
    headless: "new",
  }); */
  // const browser = await puppeteer.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  const scrapeURL = async (url) => {
    // Navigate the page to a URL
    console.log(url);
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Click play button
    const buttonSelector = ".jw-icon-playback";

    await page.waitForSelector(buttonSelector);

    while (true) {
      try {
        await page.waitForSelector(buttonSelector);
        break;
      } catch (error) {
        console.log(error);
      }
    }

    await page.click(buttonSelector);

    // Read title
    const titleSelector = ".itemaudio_titol__leaYf";

    let titleNode = [];
    while (true) {
      try {
        titleNode = await page.waitForSelector(titleSelector);
        break;
      } catch (error) {
        console.log(error);
      }
    }

    const fullTitle = await titleNode?.evaluate((el) => el.textContent);

    // Read description
    const descriptionSelector = `span[class*="itemaudio_slashVertical"]`;

    let descriptionNode = [];
    while (true) {
      try {
        descriptionNode = await page.waitForSelector(descriptionSelector);
        break;
      } catch (error) {
        console.log(error);
      }
    }

    const description = await descriptionNode?.evaluate((el) => el.textContent);

    // Read audio source
    const audioSelector = "video";

    let audioNode = [];
    while (true) {
      try {
        audioNode = await page.waitForSelector(audioSelector);
        break;
      } catch (error) {
        console.log(error);
      }
    }

    const audioSource = await audioNode?.evaluate((el) =>
      el.getAttribute("src")
    );

    const response = await fetch(audioSource, { method: "HEAD" });

    const obj = {
      title: fullTitle,
      description: description,
      fileURL: audioSource,
      fileSize: response.headers.get("content-length"),
      fileDate: response.headers.get("last-modified"),
    };
    return obj;
  };

  for (let i = urls.length - 1; i >= 0; i--) {
    console.log(`Episodi ${i}`);
    const result = await scrapeURL(urls[i]);
    allResults.push(result);
  }

  await browser.close();
  return allResults;
};

(async () => {
  const data = fs.readFileSync("./urls.txt", { encoding: "utf8" });

  const audioURLs = data.split("\n");

  const results = await scrapeData(audioURLs);

  // Generate RSS feed xml file

  const feed = new RSS({
    title: "En Guàrdia!",
    description:
      "Tots els capítols del programa En Guàrdia, de Catalunya Ràdio",
    feed_url: "https://my-podcast.com/feed.xml",
    site_url: "https://www.ccma.cat/catradio/alacarta/en-guardia/",
  });

  // Add each audio file to the RSS feed
  results.forEach((ep) => {
    feed.item({
      title: ep.title,
      enclosure: {
        url: ep.fileURL,
        size: ep.fileSize,
        type: "audio/mpeg",
      },
      date: ep.fileDate,
    });
  });

  // Generate the XML file
  const xml = feed.xml();

  // Save it into a text file
  var writeStream = fs.createWriteStream("enguardia.xml");
  writeStream.write(xml);
  writeStream.end();
})();
