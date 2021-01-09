const config = require('../config.json');
const Ingredient = require("./ingredient.model");
const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize(config.dbConnectingString);

const Recipe = sequelize.define('recipe', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        recipe: {
            type: DataTypes.TEXT
        },
        complexity: {
            type: DataTypes.DOUBLE
        },
        portions: {
            type: DataTypes.INTEGER
        }
    },
    {freezeTableName: true, timestamps: false});


sequelize.sync();

Recipe.hasMany(Ingredient, {
    foreignKey: 'recipe_id',
    onDelete: 'CASCADE'
});

module.exports = Recipe;