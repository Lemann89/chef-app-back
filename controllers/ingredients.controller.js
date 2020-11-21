const express = require('express');
const router = express.Router();
const Product = require('../models/product.model')
const Ingredient = require("../models/ingredient.model");

router.get('/', async (req , res) => {
    const ingredients = await Ingredient.findAll({include: Product});
    res.json(ingredients);
})

module.exports = router;
