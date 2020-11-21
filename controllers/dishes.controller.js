const express = require('express');
const router = express.Router();
const Product = require('../models/product.model')
const Ingredient = require("../models/ingredient.model");
const Recipe = require("../models/recipe.model");
const Dish = require("../models/dish.model");

router.get('/', async (req , res) => {
    const dishes = await Dish.findAll({
        include: {
            model: Recipe,
            include: {
                model: Ingredient,
                include: {
                    model: Product
                }
            }
        }
    });
    res.json(dishes);
})

module.exports = router;
