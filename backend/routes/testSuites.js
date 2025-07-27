const express = require('express');
const db = require('../models');
const { authenticateToken } = require('../middleware/auth');
const fetch = require('node-fetch');
const { JSONPath } = require('jsonpath-plus');

const router = express.Router();

// Middleware to verify token
router.use(authenticateToken);

// Get all test suites for the user's organization
router.get('/', async (req, res) => {
  const testSuites = await db.TestSuite.findAll({ where: { OrganizationId: req.user.organizationId } });
  res.json(testSuites);
});

// Create a new test suite
router.post('/', async (req, res) => {
  const { name, description, testCases } = req.body;
  const { organizationId } = req.user;

  try {
    const testSuite = await db.TestSuite.create({ name, description, OrganizationId: organizationId });

    if (testCases && testCases.length > 0) {
      await db.TestCase.bulkCreate(
        testCases.map((tc) => ({ ...tc, TestSuiteId: testSuite.id }))
      );
    }

    res.status(201).json(testSuite);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create test suite.' });
  }
});

// Get a single test suite by ID
router.get('/:id', async (req, res) => {
  const testSuite = await db.TestSuite.findOne({
    where: { id: req.params.id, OrganizationId: req.user.organizationId },
    include: [{ model: db.TestCase, as: 'testCases' }],
  });

  if (!testSuite) {
    return res.status(404).json({ error: 'Test suite not found.' });
  }

  res.json(testSuite);
});

// Update a test suite
router.put('/:id', async (req, res) => {
  const { name, description, testCases } = req.body;

  const testSuite = await db.TestSuite.findOne({
    where: { id: req.params.id, OrganizationId: req.user.organizationId },
  });

  if (!testSuite) {
    return res.status(404).json({ error: 'Test suite not found.' });
  }

  await testSuite.update({ name, description });

  if (testCases) {
    await db.TestCase.destroy({ where: { TestSuiteId: testSuite.id } });
    await db.TestCase.bulkCreate(
      testCases.map((tc) => ({ ...tc, TestSuiteId: testSuite.id }))
    );
  }

  res.json(testSuite);
});

// Delete a test suite
router.delete('/:id', async (req, res) => {
  const testSuite = await db.TestSuite.findOne({
    where: { id: req.params.id, OrganizationId: req.user.organizationId },
  });

  if (!testSuite) {
    return res.status(404).json({ error: 'Test suite not found.' });
  }

  await testSuite.destroy();
  res.status(204).send();
});

// Run a test suite
router.post('/:id/run', async (req, res) => {
  try {
    const testSuite = await db.TestSuite.findOne({
      where: { id: req.params.id, OrganizationId: req.user.organizationId },
      include: [{ model: db.TestCase, as: 'testCases' }],
    });

    if (!testSuite) {
      return res.status(404).json({ error: 'Test suite not found.' });
    }

    const testCases = testSuite.testCases.sort((a, b) => a.sequence - b.sequence);
    const results = [];
    const extractedVariables = {};

    for (const testCase of testCases) {
      const startTime = Date.now();
      let status = 'N/A';
      let responseBody = null;
      let passed = false;

      let url = testCase.url;
      let headers = testCase.headers;
      let body = testCase.body;

      for (const key in extractedVariables) {
        const placeholder = `{{${key}}}`;
        if(url) url = url.replace(new RegExp(placeholder, 'g'), extractedVariables[key]);
        if(headers) headers = headers.replace(new RegExp(placeholder, 'g'), extractedVariables[key]);
        if(body) body = body.replace(new RegExp(placeholder, 'g'), extractedVariables[key]);
      }

      try {
        let parsedHeaders = {};
        if (headers) {
          try {
            parsedHeaders = JSON.parse(headers);
          } catch (e) {
            console.error('Invalid headers JSON:', headers);
          }
        }

        const response = await fetch(url, {
          method: testCase.method,
          headers: parsedHeaders,
          body: body || undefined,
        });

        status = response.status;
        const responseText = await response.text();
        
        try {
          responseBody = JSON.parse(responseText);
        } catch (e) {
          responseBody = responseText;
        }

        passed = status === parseInt(testCase.expectedStatus, 10);

        if (testCase.instruction) {
          try {
            const instruction = JSON.parse(testCase.instruction);
            if (instruction.extract) {
              const { from, path, as } = instruction.extract;
              let source = from === 'body' ? responseBody : Object.fromEntries(response.headers.entries());
              if (source) {
                const extractedValue = JSONPath({ path, json: source, wrap: false });
                if (extractedValue) {
                  extractedVariables[as] = extractedValue;
                }
              }
            }
          } catch (e) {
            console.error('Invalid instruction JSON:', testCase.instruction);
          }
        }
      } catch (error) {
        responseBody = { error: error.message };
        passed = false;
      }
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      results.push({
        description: testCase.description || `Test Case #${testCase.sequence}`,
        url,
        passed,
        responseTime,
        status,
        payload: body,
        headers,
        response: responseBody,
      });
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error running test suite:', error);
    res.status(500).json({ error: 'Failed to run test suite.' });
  }
});

module.exports = router;