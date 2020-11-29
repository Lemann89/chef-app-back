const config = require('../config.json');
const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize(config.dbConnectingString);

const IngredientType = sequelize.define('ingredient_type', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        storage_type: {
            type: DataTypes.STRING(20)
        }
    },
    {freezeTableName: true, timestamps: false});


sequelize.sync();

module.exports = IngredientType;