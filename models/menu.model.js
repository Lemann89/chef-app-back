const config = require('../config.json');
const Dish = require("./dish.model");
const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize(config.dbConnectingString);

const Menu = sequelize.define('menu', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        dish_id: {
            type: DataTypes.INTEGER
        },
        portion_quantity: {
            type: DataTypes.INTEGER
        },
        date: {
            type: DataTypes.DATE
        }
    },
    {freezeTableName: true, timestamps: false});

sequelize.sync();

Menu.belongsTo(Dish, {
    foreignKey: 'dish_id'
});

module.exports = Menu;