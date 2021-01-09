const express = require('express');
const orderHistory = require("../models/orderHistory.model");
const Product = require("../models/product.model");
const router = express.Router();

router.get('/', async (req, res) => {
    const history = await orderHistory.findAll({
        include: Product
    });
    res.json(history);
});

module.exports = router;