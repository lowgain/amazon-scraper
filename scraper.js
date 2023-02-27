const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const AMAZON_URL = "https://amazon.com/exec/obidos/tg/detail/-/";
const USER_AGENT = {
  headers: {
    'User-Agent': "Mozilla/5.0 (X11; Linux i686; rv:106.0) Gecko/20100101 Firefox/106.0"
  }
};

fs.readFile("asins.txt", function(err, asinList) {
  if (err) throw err; 
  asinList = asinList.toString().split("\r\n");
  asinList.pop();
  fetchItems(asinList)
    .then(items => console.table(items))
    .catch(err => console.warn("There was an error, ", err));
});

async function fetchItems(asins) {
  let items = [];
  for (i in asins) {
    const asin = asins[i];
    const html = await axios.get(AMAZON_URL + asin, USER_AGENT)
      .then(response => response.data)
      .catch(err => console.warn("There was an error", err));
    const $ = cheerio.load(html);
    const name = $('span#productTitle').text().trim().slice(0, 80);
    const sale = $('span.savingsPercentage').text();
    let price = $('span.a-price-whole').text().split(".")[0];
    const item = { asin, name, sale, price };
    items.push(item);
  };
  return items;
};
