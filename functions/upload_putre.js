const rp = require("request-promise");
const crypto = require("crypto");

exports.handler = async (event, context) => {
  const { pageToScreenshot, file } = JSON.parse(event.body);
  console.log("file", file);
  if (!pageToScreenshot)
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Page URL not defined" })
    };
  if (!file) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "File not defined" })
    };
  }

  try {
    const { data } = await rp.post({
      url: "https://api.put.re/upload",
      formData: {
        file: {
          value: Buffer.from(file, "base64"),
          options: {
            filename: `${crypto
              .createHash("md5")
              .update(pageToScreenshot)
              .digest("hex")}.png`
          }
        }
      },
      json: true
    });
    console.log(`Complete upload to put.re of ${pageToScreenshot}`);
    return {
      statusCode: 200,
      body: JSON.stringify({
        data
      })
    };
  } catch (error) {
    //console.log(error);
    return { statusCode: 500, body: error.toString() };
  }
};
