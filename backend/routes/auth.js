const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../models');

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email, and password.' });
  }

  try {
    const transaction = await db.sequelize.transaction();
    
    const organization = await db.Organization.create({ name }, { transaction });
    const user = await db.User.create({ email, password, OrganizationId: organization.id }, { transaction });

    await transaction.commit();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(400).json({ error: 'This email is already registered.' });
  }
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await db.User.findOne({ where: { email } });

  if (!user || !(await user.validPassword(password))) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = jwt.sign(
    { id: user.id, organizationId: user.OrganizationId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

module.exports = router;