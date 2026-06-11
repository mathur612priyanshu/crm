const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define('Setting', {
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
  value: {
    type: DataTypes.TEXT, // Using TEXT to store JSON string for flexibility
    allowNull: false,
  },
}, {
  timestamps: true,
});

Setting.sync({ alter: true }).catch(err => console.error("Error syncing Setting table:", err));

module.exports = Setting;
