const express = require('express');
const Warehouse = require("../models/warehouse.model");
const Product = require("../models/product.model");
const router = express.Router();
const config = require('../config.json');
const {QueryTypes, Sequelize} = require('sequelize');
const sequelize = new Sequelize(config.dbConnectingString);

let warehouseProduct;

router.get('/', async (req, res) => {
    const products = await Warehouse.findAll({
        include: {
            model: Product,
        }
    });
    res.json(products);
})
router.get('/:id', async (req, res) => {
    warehouseProduct = await Warehouse.findOne({
        include: {
            model: Product,
        },
        where: {
            product_id: req.params.id
        }
    });
    res.json(warehouseProduct);
})

router.put('/updatequantity', async (req, res) => {
    req.body.forEach(p => {
        sequelize.query(`
            BEGIN TRANSACTION;
        
            UPDATE warehouse
            SET quantity = quantity + ${p.quantity}
            WHERE product_id = ${p.product_id};
            
            INSERT INTO order_history (product_id, quantity)
            VALUES (${p.product_id}, ${p.quantity});
            
            COMMIT;
        `)
    })
    res.status(200).send('Success');
});

module.exports = router;
