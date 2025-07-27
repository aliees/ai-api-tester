const sequelize = require('../config/database');
const Organization = require('./Organization');
const User = require('./User');
const TestSuite = require('./TestSuite');
const TestCase = require('./TestCase');

Organization.hasMany(User);
User.belongsTo(Organization);

Organization.hasMany(TestSuite);
TestSuite.belongsTo(Organization);

TestSuite.hasMany(TestCase, { as: 'testCases', onDelete: 'CASCADE', hooks: true });
TestCase.belongsTo(TestSuite);

const db = {
  sequelize,
  Sequelize: sequelize.Sequelize,
  Organization,
  User,
  TestSuite,
  TestCase,
};

module.exports = db;