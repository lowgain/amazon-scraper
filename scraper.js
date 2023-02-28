const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const AMAZON_URL = "https://amazon.com/exec/obidos/tg/detail/-/";
const USER_AGENT = {
  headers: {
    'User-Agent': "Mozilla/5.0 (X11; Linux i686; rv:106.0) Gecko/20100101 Firefox/106.0"
  }
};

fs.readFile('asins.json', async (err, asins) => {
  if (err) throw err; 
  asins = JSON.parse(asins);
  for ( i in asins ) {
    console.log();
    console.log("----------  " + i + "  ----------")
    console.log();
    const group = asins[i];
    let items = [];
    for ( asin of group ) {
      if ( asin.slice(0,1) == "#" ) {
        continue
      } else if ( asin != "" ) {
        await getItem(asin)
          .then(item => items.push(item))
          .catch(err => console.warn("There was an error", err));
      };
    };
    console.table(items);
  };
});

async function getItem(asin) {
  const html = await axios.get(AMAZON_URL + asin, USER_AGENT)
    .then(response => response.data)
    .catch(err => console.warn("There was an error", err));
  const $ = cheerio.load(html);
  const name = $('span#productTitle').text().trim().slice(0, 80);
  const price = $('span.a-price-whole').text().split(".")[0];
  const sale = $('span.savingsPercentage').text() ? $('span.savingsPercentage').text().split('-')[1] : false;
  const link = AMAZON_URL + asin;
  return { name, price, sale, link };
};
