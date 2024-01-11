const puppeteer = require("puppeteer");
const { Configuration, NopeCHAApi } = require("nopecha");
const UserAgent = require("user-agents");
const nodemailer = require("nodemailer");

// config nopecha
const configuration = new Configuration({
  apiKey: "kek8uffmxme4u1uc",
});
const nopecha = new NopeCHAApi(configuration);

//config nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "edwinchanjy96@gmail.com",
    pass: "qjez lgaz upqv bmaq",
  },
});

const mailOptions = {
  from: "devilmaydie123@gmail.com",
  to: "edwinchanjy@hotmail.com",
  subject: "NOPECHA OUT OF CREDIT",
  text: "RELOAD RELOAD RELOAD!",
};

(async () => {
  // Get nopecha balance
  const balance = await nopecha.getBalance();

  // Send email if balance is less than 100
  if (balance.credit < 100) {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return;
  }

  const browser = await puppeteer.launch({ headless: "false" });

  const page = await browser.newPage();

  // Set a random user agent for the browser
  const userAgent = new UserAgent();
  await page.setUserAgent(userAgent.toString());

  // Navigating to a website
  await page.goto("https://testrecaptcha.github.io");

  // Get the recaptcha checkbox iframe
  await page.waitForSelector("iframe");
  const iframeHandle = await page.$('iframe[title="reCAPTCHA"]');
  const iframe = await iframeHandle.contentFrame();

  // Click the checkbox
  const checkboxSelector = ".rc-anchor-center-container";
  await iframe.waitForSelector(checkboxSelector);
  await iframe.click(checkboxSelector);

  // Get the captcha image iframe
  await page.waitForSelector("iframe");
  const imageIframeHandle = await page.$(
    'iframe[title="recaptcha challenge expires in two minutes"]'
  );
  const imageIframe = await imageIframeHandle.contentFrame();

  // Scrap for instruction text
  await imageIframe.waitForSelector(".rc-imageselect-desc-wrapper");

  const instruction = await imageIframe.$eval(
    ".rc-imageselect-desc-wrapper",
    (element) => element.textContent
  );

  // Scrap for captcha image
  const imgSrc = await imageIframe.$eval(
    ".rc-image-tile-wrapper > img",
    (img) => img.src
  );

  // Get the class name to determine the grid
  const grid = await imageIframe.$eval(
    ".rc-image-tile-wrapper > img",
    (img) => img.className
  );

  // Call the Recognition API
  const clicks = await nopecha.solveRecognition({
    type: "recaptcha",
    task: instruction,
    image_urls: [imgSrc],
    grid: grid.includes("44") ? "4x4" : "3x3",
  });

  console.log("Instruction: ", instruction);
  console.log("Image: ", imgSrc);
  console.log("Grids to click: ", clicks);

  // Screenshot of the current page for cross checking purpose
  await page.screenshot({ path: "result.png" });

  await browser.close();
})();
