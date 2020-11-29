const config = require('../config.json');
const Product = require("./product.model");
const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize(config.dbConnectingString);

const Warehouse = sequelize.define('warehouse', {
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
        }
    },
    {freezeTableName: true, timestamps: false});

sequelize.sync();

Warehouse.belongsTo(Product, {
    foreignKey: 'product_id'
});

module.exports = Warehouse;