const axios = require('axios')
const cheerio = require('cheerio')

const Item = require('../models/item');

const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

// Display home page
exports.index = asyncHandler( async(req, res, next) => {
  const [ numItems, allItems ] = await Promise.all([
    Item.countDocuments({}).exec(),
    Item.find({}).exec(),
  ]);
  res.render('index', {
    title: 'Amzn Scraper',
    item_count: numItems,
    item_list: allItems,
  });
})

// Display details on one item
exports.item_details = asyncHandler( async (req, res, next) => {
  const item = await Item.find({asin: req.params.asin});
  res.render('item_details', {
    title: 'Item Details',
    item: item,
  })
})

// Handle item create on POST
exports.item_create = [
  body("asin", "Asin must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    const AMAZON_URL = "https://amazon.com/exec/obidos/tg/detail/-/";
    const USER_AGENT = {
      headers: {
        'User-Agent': "Mozilla/5.0 (X11; Linux i686; rv:106.0) Gecko/20100101 Firefox/108.0"
      }
    };
    const html = await axios.get(AMAZON_URL + req.body.asin, USER_AGENT)
      .then(res=> res.data)
      .catch(err => console.warn("There was an error", err));
    const $ = cheerio.load(html);
    const name = $('span#productTitle').text().trim().slice(0, 80);
    const price = $('span.a-price-whole').text().split(".")[0];
    const sale = $('span.savingsPercentage').text() ? $('span.savingsPercentage').text().split('-')[1] : false;

    // Create a Item object with escaped and trimmed data.
    const item = new Item({
      asin: req.body.asin,
      name: name,
      price: price,
      sale: sale,
    });

    if (errors.isEmpty()) {
      await item.save();
      res.redirect('index');
    }
  })
];

// Handle item removal on DELETE
exports.item_delete = asyncHandler( async(req, res, next) => {
  Item.findOneAndDelete({asin: req.params.asin});
  res.redirect('index');
})