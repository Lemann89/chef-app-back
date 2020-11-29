const express = require('express');
const router = express.Router();
const Product = require('../models/product.model')
const Ingredient = require("../models/ingredient.model");
const Recipe = require("../models/recipe.model");
const Dish = require("../models/dish.model");
const IngredientType = require("../models/ingredientType.model");
const {QueryTypes, Sequelize} = require('sequelize');
const config = require('../config.json');
const sequelize = new Sequelize(config.dbConnectingString);

router.get('/', async (req, res) => {
    const dishes = await Dish.findAll({
        include: {
            model: Recipe,
            include: {
                model: Ingredient,
                include: [
                    {
                        model: Product
                    },
                    {
                        model: IngredientType
                    }
                ]
            }
        }
    });
    res.json(dishes);
})

router.get('/:id', async (req, res) => {
    const dish = await Dish.findOne({
        where: {
            id: req.params.id
        },
        include: {
            model: Recipe,
            include: {
                model: Ingredient,
                include: [
                    {
                        model: Product
                    },
                    {
                        model: IngredientType
                    }
                ]
            }
        }
    })
    res.json(dish);
})

router.get('/:id/params', async (req, res) => {
    const dishCalories = await sequelize.query(`
        SELECT dish_name,
          ROUND(SUM(((fats * gram_product * 1.0 / 100)))::numeric, 2)                               AS fats,
          ROUND(SUM(((proteins * gram_product * 1.0 / 100)))::numeric, 2)                           AS proteins,
          ROUND(SUM(((carbohydrates * gram_product * 1.0 / 100)))::numeric, 2)                      AS carbohydrates,
          ROUND(SUM(((kilocalories * gram_product * 1.0 / 100)))::numeric, 2)                       AS kilocalories,
          ROUND(SUM(((product_price * gram_product * 1.0 / 1000) * recipe_complexity))::numeric, 0) AS price
        FROM (
                 SELECT dish.name                           AS dish_name,
                        pgc.gram_koefficient,
                        (i.quantity * pgc.gram_koefficient) AS gram_product,
                        fats,
                        proteins,
                        carbohydrates,
                        kilocalories,
                        pgc.id,
                        i.product_type_id,
                        p.price                             AS product_price,
                        r.complexity                        AS recipe_complexity,
                        i.quantity,
                        p.name                              as p_name
                 FROM dish
                          INNER JOIN recipe r on r.id = dish.recipe_id
                          INNER JOIN ingredient i on r.id = i.recipe_id
                          INNER JOIN product p on p.id = i.product_id
                          INNER JOIN ingredient_type it on it.id = i.product_type_id
                          INNER JOIN product_gram_convertor pgc
                                     on p.id = pgc.product_id AND i.product_type_id = pgc.ingredient_type_id
                 WHERE dish.id = ${req.params.id}) as dripip
        GROUP BY 1
    `, {type: QueryTypes.SELECT})
    res.json(dishCalories[0]);
})

module.exports = router;
