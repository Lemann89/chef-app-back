const express = require('express');
const router = express.Router();
const Product = require('../models/product.model')
const Ingredient = require("../models/ingredient.model");
const Recipe = require("../models/recipe.model");

router.get('/', async (req, res) => {
    const recipes = await Recipe.findAll({
        include: {
            model: Ingredient,
            include: {
                model: Product
            }
        }
    });
    res.json(recipes);
})

module.exports = router;
