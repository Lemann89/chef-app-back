const express = require('express');
const router = express.Router();
const Product = require('../models/product.model')

router.get('/', async (req , res) => {
    const products = await Product.findAll();
    res.json(products);
})

router.get('/:id', async (req , res) => {
    const product = await Product.findByPk(req.params.id);
    res.json(product);
})

module.exports = router;

