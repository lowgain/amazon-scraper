const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const AMAZON_URL = "https://amazon.com/exec/obidos/tg/detail/-/";

fs.readFile("asins.txt", function(err, asinList) {
  if (err) throw err; 
  asinList = asinList.toString().split("\r\n");
  fetchItems(asinList)
    .then(items => console.table(items))
    .catch(err => console.warn("There was an error, ", err));
});

async function fetchItems(asins) {
  let items = [];
  for (i in asins) {
    let asin = asins[i];
    try {
      const html = await axios.get(AMAZON_URL + asin, { headers: {'User-Agent': "Mozilla/5.0 (X11; Linux i686; rv:106.0) Gecko/20100101 Firefox/106.0"}})
        .then(response => response.data)
        .catch(err => console.warn("There was an error", err));
      const $ = cheerio.load(html);
      let name = $('span#productTitle').text().trim();
      let price = $('span.a-price-whole').text().split(".")[0];
      let sale = $('span.savingsPercentage').text();
      let item = {
        name,
        sale,
        price,
        asin
      };
      items.push(item);
    } catch (err) { throw err };
  };
  return items;
};
