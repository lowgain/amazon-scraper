const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const AMAZON_URL = "https://amazon.com/exec/obidos/tg/detail/-/";
const USER_AGENT = {
  headers: {
    'User-Agent': "Mozilla/5.0 (X11; Linux i686; rv:106.0) Gecko/20100101 Firefox/106.0"
  }
};

fs.readFile("asins.txt", async (err, asinList) => {
  asinList = asinList.toString().split("\r\n");
  let items = [];
  for (asin of asinList) {
    if ( asin != "" ) {
      await getItem(asin)
        .then(item => items.push(item))
        .catch(err => console.warn("There was an error", err));
    };
  };
  console.table(items);
  if (err) throw err; 
});

async function getItem(asin) {
  const html = await axios.get(AMAZON_URL + asin, USER_AGENT)
    .then(response => response.data)
    .catch(err => console.warn("There was an error", err));
  const $ = cheerio.load(html);
  const name = $('span#productTitle').text().trim().slice(0, 80);
  const sale = $('span.savingsPercentage').text();
  const price = $('span.a-price-whole').text().split(".")[0];
  return { asin, name, sale, price };
};
