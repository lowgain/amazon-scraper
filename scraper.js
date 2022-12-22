const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const AMAZON_URL = "https://amazon.com/exec/obidos/tg/detail/-/";
const SALE = 0.85;

setInterval(main, 10000);

function main() {
    fs.readFile("asins.txt", function(err, asinList) {
        if (err) throw err; 
        asinList = asinList.toString().split("\r\n");
        fetchItems(asinList)
            .then(items => {
                fs.readFile("db.json", (err, oldItems) => {
                    oldItems = JSON.parse(oldItems.toString());
                    let newList = [];
                    for (i in items) {
                        let item = items[i];
                        let oldItem = oldItems.find(val => { if (val.asin == item.asin) return val });
                        if (oldItem) {
                            if (item.price <= oldItem.price * SALE) {
                                console.log("This item is on sale: ", item.name)
                            } else if (item.price >= oldItem.price / SALE) {
                                console.log("This item is no longer on sale: ", item.name)
                            }
                        };
                        newList.push(item);
                    };
                    fs.writeFile("db.json", JSON.stringify(newList), err => {if (err) throw err});
                });
            })
            .catch(err => console.warn("There was an error, ", err));
    });
};

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
            let item = {
                    asin,
                    name,
                    price
            };
            items.push(item);
        } catch (err) { throw err };
    };
    return items;
};