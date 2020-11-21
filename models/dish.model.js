const config = require('../config.json');
const Recipe = require("./recipe.model");
const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize(config.dbConnectingString);

const Dish = sequelize.define('dish', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50)
        },
        recipe_id: {
            type: DataTypes.INTEGER
        },
        price: {
            type: DataTypes.DOUBLE
        },
        imageURL: {
            type: DataTypes.STRING(255)
        }
    },
    {freezeTableName: true, timestamps: false});



Dish.belongsTo(Recipe, {
    foreignKey: 'recipe_id'
})

sequelize.sync();

module.exports = Dish;