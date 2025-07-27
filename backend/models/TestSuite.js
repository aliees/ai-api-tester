const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TestSuite = sequelize.define('TestSuite', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
});

module.exports = TestSuite;