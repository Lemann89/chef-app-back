const config = require('../config.json');
const Product = require("./product.model");
const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize(config.dbConnectingString);

const orderHistory = sequelize.define('order_history', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.INTEGER
        },
        quantity: {
            type: DataTypes.INTEGER
        },
        date: {
            type: DataTypes.DATE
        }
    },
    {freezeTableName: true, timestamps: false});

sequelize.sync();

orderHistory.belongsTo(Product, {
    foreignKey: 'product_id'
});

module.exports = orderHistory;