const config = require('../config.json');
const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize(config.dbConnectingString);

const Product = sequelize.define('product', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50)
        },
        price: {
            type: DataTypes.DOUBLE
        },
        fats: {
            type: DataTypes.DOUBLE
        },
        proteins: {
            type: DataTypes.DOUBLE
        },
        carbohydrates: {
            type: DataTypes.DOUBLE
        },
        kilocalories: {
            type: DataTypes.DOUBLE
        }
    },
    {freezeTableName: true, timestamps: false});


sequelize.sync();


module.exports = Product;