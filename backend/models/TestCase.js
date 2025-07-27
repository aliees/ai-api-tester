const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TestCase = sequelize.define('TestCase', {
  sequence: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  headers: {
    type: DataTypes.TEXT,
  },
  body: {
    type: DataTypes.TEXT,
  },
  expectedStatus: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  instruction: {
    type: DataTypes.TEXT,
  },
});

module.exports = TestCase;