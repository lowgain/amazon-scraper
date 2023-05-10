var mongoose = require('mongoose');

const Schema = mongoose.Schema;

const itemSchema = new Schema({
  asin: { type: String },
  name: { type: String, required: true, maxLength: 100 },
  price: { type: Number },
  sale: { type: String },
});

// Virtual for items's URL
itemSchema.virtual("url").get(function () {
  return `/${this.asin}`;
});

// Virtual for items's Amazon URL
itemSchema.virtual("amzn_url").get(function () {
  return `https://amazon.com/exec/obidos/tg/detail/-/${this.asin}`;
});

module.exports = mongoose.model("Item", itemSchema);