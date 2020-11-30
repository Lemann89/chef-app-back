const express = require('express');
const Menu = require("../models/menu.model");
const router = express.Router();
const {QueryTypes, Sequelize} = require('sequelize');
const config = require('../config.json');
const Dish = require("../models/dish.model");
const sequelize = new Sequelize(config.dbConnectingString);

router.get('/', async (req, res) => {
    const menu = await Menu.findAll({
        include: Dish
    })
    res.json(menu);
})

router.put('/insertdishes', async (req, res) => {

    await req.body.map(dish => {
        Menu.create({
            dish_id: dish.dish_id,
            portion_quantity: dish.portion_quantity,
            date: req.body.date
        })
    })
    res.status(200).send('Success');
})

router.post('/:id/ingredients', async (req, res) => {
    const menuDishIngredients = await sequelize.query(`
        SELECT dish.name AS dish_name,
                    m.portion_quantity AS portion_quantity,
                    ROUND((i.quantity / portions * m.portion_quantity)::numeric, 1)                         AS ingredients_quantity,
                    it.storage_type,
                    p.name
             FROM dish
                      INNER JOIN recipe r on r.id = dish.recipe_id
                      INNER JOIN ingredient i on r.id = i.recipe_id
                      INNER JOIN ingredient_type it on it.id = i.product_type_id
                      INNER JOIN product p on p.id = i.product_id
                      INNER JOIN dish d on r.id = d.recipe_id
                      INNER JOIN menu m on d.id = m.dish_id
             WHERE m.dish_id = ${req.params.id} AND m.date = '${req.body.date}'
    `, {type: QueryTypes.SELECT});
    res.json(menuDishIngredients);
})

router.post('/:id/params', async (req, res) => {
    const menuDishParams = await sequelize.query(`
            SELECT dish_name,
               portion_quantity,
               ROUND(SUM(((fats * gram_product / 100.0)))::numeric, 2)                               AS fats,
               ROUND(SUM(((proteins * gram_product / 100.0)))::numeric, 2)                           AS proteins,
               ROUND(SUM(((carbohydrates * gram_product / 100.0)))::numeric, 2)                      AS carbohydrates,
               ROUND(SUM(((kilocalories * gram_product / 100.0)))::numeric, 2)                       AS kilocalories,
               ROUND(SUM(((product_price * gram_product / 1000.0) * recipe_complexity))::numeric, 0) AS price
            FROM (
                     SELECT dish.name AS dish_name,
                            portions,
                            m.portion_quantity AS portion_quantity,
                            i.quantity,
                            (ROUND((i.quantity / portions * m.portion_quantity)::numeric, 1) * pgc.gram_koefficient) AS gram_product,
                            fats,
                            proteins,
                            carbohydrates,
                            kilocalories,
                            p.price                                                                 as product_price,
                            r.complexity                                                            AS recipe_complexity
                     FROM dish
                              INNER JOIN recipe r on r.id = dish.recipe_id
                              INNER JOIN ingredient i on r.id = i.recipe_id
                              INNER JOIN ingredient_type it on it.id = i.product_type_id
                              INNER JOIN product p on p.id = i.product_id
                              INNER JOIN dish d on r.id = d.recipe_id
                              INNER JOIN menu m on d.id = m.dish_id
                              INNER JOIN product_gram_convertor pgc
                                         on p.id = pgc.product_id AND i.product_type_id = pgc.ingredient_type_id
                     WHERE m.dish_id = ${req.params.id} AND m.date = '${req.body.date}' ) as stevedoh
            GROUP BY 1,2
    `, {type: QueryTypes.SELECT});
    res.json(menuDishParams)
})

module.exports = router;

