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
});

router.delete('/:id/delete', async (req, res) => {
    await Recipe.destroy({
        where : {
            id: req.params.id
        }
    }).catch(err => {
        console.log(err);
    });
    res.status(204).send('Success delete');
});

module.exports = router;
