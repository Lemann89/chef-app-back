const express = require('express');
const Menu = require("../models/menu.model");
const router = express.Router();
const {QueryTypes, Sequelize} = require('sequelize');
const config = require('../config.json');
const Dish = require("../models/dish.model");
const sequelize = new Sequelize(config.dbConnectingString);

router.get('/', async (req, res) => {
    const menuDishes = await sequelize.query(`
            SELECT menu.id AS id,
               "imageURL",
               name,
               dish_id,
               portion_quantity,
               date,
               cooked
            FROM menu INNER JOIN dish d on d.id = menu.dish_id
            ORDER BY date
            `, {type: QueryTypes.SELECT});
    res.json(menuDishes);
})

router.post('/create', async (req, res) => {
    let dishes = []

    await Promise.all(req.body.map(dish => {
        return sequelize.query(`
            SELECT dish_id,
                   ${dish.portion_quantity} as portion_quantity,
                   '${dish.date}' as date,
                   p_name,
                   dish_name,
                   bool_and(CASE WHEN (w.quantity - kilogram_product) > 1 THEN TRUE ELSE FALSE END) as is_exist
            FROM (
                     SELECT dish.name                                      AS dish_name,
                            ROUND((i.quantity / portions * ${dish.portion_quantity})::numeric, 1) AS ingredients_quantity,
                            ROUND(((i.quantity / portions * ${dish.portion_quantity}) * pgc.gram_koefficient)::numeric, 1) *
                            0.001                                          AS kilogram_product,
                            it.storage_type,
                            p.name                                         AS p_name,
                            p.id                                           AS p_id,
                            d.id                                           AS dish_id
                     FROM dish
                              INNER JOIN recipe r on r.id = dish.recipe_id
                              INNER JOIN ingredient i on r.id = i.recipe_id
                              INNER JOIN ingredient_type it on it.id = i.product_type_id
                              INNER JOIN product p on p.id = i.product_id
                              INNER JOIN dish d on r.id = d.recipe_id
                              INNER JOIN product_gram_convertor pgc
                                         on p.id = pgc.product_id AND i.product_type_id = pgc.ingredient_type_id
                     WHERE dish.id = ${dish.dish_id}) as q
                     INNER JOIN warehouse w on w.product_id = p_id
            GROUP BY  dish_id, dish_name, p_name`, {type: QueryTypes.SELECT});
    })).then(result => {
        result.forEach(item => {
            dishes.push(item)
            return dishes;
        })
        res.json(dishes);
    });
    await dishes.forEach(dish => {
        let isIngredient = true;
        let dishId = dish[0].dish_id;
        let portionQuantity = dish[0].portion_quantity;
        let date = dish[0].date;
        dish.forEach(item => {
            if (!item.is_exist) {
                isIngredient = false
            }
        })
        if (isIngredient) {
            Menu.create({
                dish_id: dishId,
                portion_quantity: portionQuantity,
                date: date
            })
        }
    })
    res.status(201);
})

router.put('/:id/status', async (req, res) => {
    await sequelize.query(`
    BEGIN TRANSACTION;

    UPDATE warehouse
    SET quantity = quantity - kilogram_product
    FROM (
             SELECT ROUND(((i.quantity / portions * menu.portion_quantity) * pgc.gram_koefficient)::numeric, 1) *
                    0.001 AS kilogram_product,
                    p.id  as p_id
             FROM menu
                      INNER JOIN dish d on d.id = menu.dish_id
                      INNER JOIN recipe r on r.id = d.recipe_id
                      INNER JOIN ingredient i on r.id = i.recipe_id
                      INNER JOIN product p on p.id = i.product_id
                      INNER JOIN product_gram_convertor pgc
                                 on p.id = pgc.product_id AND i.product_type_id = pgc.ingredient_type_id
             WHERE menu.id = ${req.params.id}) as fn
    WHERE product_id = fn.p_id;
    
    UPDATE menu SET cooked = true
    WHERE menu.id = ${req.params.id};
    
    COMMIT;`);

    res.status(200).send('Success');
})

router.get('/:id/ingredients', async (req, res) => {
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
             WHERE m.id = ${req.params.id}
    `, {type: QueryTypes.SELECT});
    res.json(menuDishIngredients);
})

router.get('/:id/params', async (req, res) => {
    const menuDishParams = await sequelize.query(`
            SELECT dish_name,
                   recipe,
                   image,
                   portion_quantity,
                   ROUND(SUM(((fats * gram_product / 100.0)))::numeric, 2)                               AS fats,
                   ROUND(SUM(((proteins * gram_product / 100.0)))::numeric, 2)                           AS proteins,
                   ROUND(SUM(((carbohydrates * gram_product / 100.0)))::numeric, 2)                      AS carbohydrates,
                   ROUND(SUM(((kilocalories * gram_product / 100.0)))::numeric, 2)                       AS kilocalories,
                   ROUND(SUM(((product_price * gram_product / 1000.0) * recipe_complexity))::numeric, 0) AS price
            FROM (
                     SELECT dish.name              AS dish_name,
                            d."imageURL"           as image,
                            recipe                 as recipe,
                            portions,
                            m.portion_quantity     AS portion_quantity,
                            i.quantity,
                            (ROUND((i.quantity / portions * m.portion_quantity)::numeric, 1) *
                             pgc.gram_koefficient) AS gram_product,
                            fats,
                            proteins,
                            carbohydrates,
                            kilocalories,
                            p.price                as product_price,
                            r.complexity           AS recipe_complexity
                     FROM dish
                              INNER JOIN recipe r on r.id = dish.recipe_id
                              INNER JOIN ingredient i on r.id = i.recipe_id
                              INNER JOIN ingredient_type it on it.id = i.product_type_id
                              INNER JOIN product p on p.id = i.product_id
                              INNER JOIN dish d on r.id = d.recipe_id
                              INNER JOIN menu m on d.id = m.dish_id
                              INNER JOIN product_gram_convertor pgc
                                         on p.id = pgc.product_id AND i.product_type_id = pgc.ingredient_type_id
                     WHERE m.id = ${req.params.id}) as stevedoh
            GROUP BY 1, 2, 3, 4
    `, {type: QueryTypes.SELECT});
    res.json(menuDishParams[0])
})

module.exports = router;

