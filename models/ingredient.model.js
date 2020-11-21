const config = require('../config.json');
const Product = require("./product.model");
const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize(config.dbConnectingString);

const Ingredient = sequelize.define('ingredient', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.INTEGER
        },
        recipe_id: {
            type: DataTypes.INTEGER
        },
        quantity: {
            type: DataTypes.INTEGER
        },
        product_type_id: {
            type: DataTypes.INTEGER
        },
    },
    {freezeTableName: true, timestamps: false});


sequelize.sync();

Ingredient.belongsTo(Product, {
    foreignKey: 'product_id'
});

module.exports = Ingredient;