var express = require('express');
var router = express.Router();

const itemController = require('../controllers/itemController')

// GET home page.
router.get('/', itemController.index);

// GET item details page.
router.get('/:asin', itemController.item_details)

// POST request from item creation form.
router.post('/', itemController.item_create)

// DELETE request from item deletion form.
router.delete('/:asin', itemController.item_delete)

module.exports = router;
