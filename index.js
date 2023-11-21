import RSS from "rss";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

const fetchData = async (url) => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: "new" });
  // false, slowMo: 100 });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // Click play button
  const buttonSelector = ".jw-icon-playback";

  await page.waitForSelector(buttonSelector);
  await page.click(buttonSelector);

  // Read title
  const titleSelector = ".itemaudio_titol__leaYf";
  const titleNode = await page.waitForSelector(titleSelector);
  const fullTitle = await titleNode?.evaluate((el) => el.textContent);

  // Read audio source
  const audioSelector = "video";
  const audioNode = await page.waitForSelector(audioSelector);
  const audioSource = await audioNode?.evaluate((el) => el.getAttribute("src"));

  await browser.close();
  const response = await fetch(audioSource, { method: "HEAD" });

  const obj = {
    title: fullTitle,
    fileURL: audioSource,
    fileSize: response.headers.get("content-length"),
    fileDate: response.headers.get("last-modified"),
  };

  return obj;
};

(async () => {
  const audioURLs = [
    "https://www.ccma.cat/3cat/3-la-primera-guerra-carlina/audio/99528/",
    "https://www.ccma.cat/3cat/2-pirates-i-corsaris/audio/99541/",
    "https://www.ccma.cat/3cat/1-la-batalla-dalmenar/audio/99527/",
  ];

  audioURLs.forEach(async (url) => {
    const episode = await fetchData(url);
    console.log(episode);
  });

  // Generate RSS feed xml file

  const feed = new RSS({
    title: "En Guàrdia!",
    description: "A podcast about my favorite things",
    feed_url: "https://my-podcast.com/feed.xml",
    site_url: "https://my-podcast.com",
  });

  // Add each audio file to the RSS feed
  /*   files.forEach((file) => {
    const url = `https://storage.googleapis.com/your-bucket-name/${file.name}`;
    feed.item({
      title: file.name,
      description: "Listen to this audio track",
      url,
      enclosure: {
        url,
        size: file.metadata.size,
        type: "audio/mpeg",
      },
    });
  }); */

  // Generate the XML file
  const xml = feed.xml();
})();
