const chromium = require("chrome-aws-lambda");
const rp = require("request-promise");
const { URL } = process.env;
exports.handler = async (event, context) => {
  const { pageToScreenshot, upload } = JSON.parse(event.body);

  if (!pageToScreenshot)
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Page URL not defined" })
    };
  try {
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    });

    const page = await browser.newPage();

    await page.goto(pageToScreenshot, { waitUntil: "networkidle2" });

    const screenshot = await page.screenshot({ encoding: "base64" });
    await browser.close();
    if (upload) {
      try {
        const { data } = await rp.post({
          url: `${URL}/.netlify/functions/upload_putre`,
          body: {
            pageToScreenshot,
            file: screenshot
          },
          json: true
        });

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: `Complete screenshot of ${pageToScreenshot}`,
            data
          })
        };
      } catch (error) {
        console.log("Upload Error");
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Complete screenshot of ${pageToScreenshot}`,
        data: screenshot
      })
    };
  } catch (error) {
    //console.log(error);
    return { statusCode: 500, body: error.toString() };
  }
};
