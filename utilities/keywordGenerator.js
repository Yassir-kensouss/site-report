const puppeteer = require("puppeteer");

const keywordGenerator = async prompt => {
  // open a new browser
  const browser = await puppeteer.launch();

  // create a new page
  const page = await browser.newPage();

  // navigate to google
  await page.goto("https://www.wordtracker.com/search?query=scrum");

  // type slowly and parse the keyword
  // const input = await page.$("#search-box");
  // await input.type("agile", { delay: 200 });
  // await input.press("Enter");

  // go to ul class listbox
  // await page.waitForSelector(".keyword-text");

  // extracting keywords from ul li span
  // const search = await page.evaluate(() => {
  //   // count over the li's starting with 0
  //   const srcList = document.getElementById("reactapp");
  //   console.log("srcList", srcList);

  //   // loop over each li store the results as x
  //   // let item = Object.values(listBox).map(x => {
  //   //   return {
  //   //     keyword: x.querySelector("span").innerText,
  //   //   };
  //   // });
  //   return srcList;
  // });

  const searchValue = await page.$eval(".toggle-button", el =>
    console.log("searchValue", el)
  );

  return { search };

  await browser.close();
};

module.exports = keywordGenerator;
