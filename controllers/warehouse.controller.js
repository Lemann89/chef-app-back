const express = require('express');
const Warehouse = require("../models/warehouse.model");
const Product = require("../models/product.model");
const router = express.Router();


router.get('/', async (req, res) => {
    const products = await Warehouse.findAll({
        include: {
            model: Product,
        }
    });
    res.json(products);
})
router.get('/:id', async (req, res) => {
    const product = await Warehouse.findOne({
        include: {
            model: Product,
        },
        where: {
            product_id : req.params.id
        }
    });
    res.json(product);
})

module.exports = router;
