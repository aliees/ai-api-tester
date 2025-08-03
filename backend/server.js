require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const ejs = require('ejs');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { JSONPath } = require('jsonpath-plus');
const db = require('./models');
const authRoutes = require('./routes/auth');
const testSuiteRoutes = require('./routes/testSuites');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Add a middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/test-suites', testSuiteRoutes);

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.get('/db-test', async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.send('Database connection has been established successfully.');
  } catch (error) {
    res.status(500).send('Unable to connect to the database: ' + error.message);
  }
});

app.post('/generate-tests', async (req, res) => {
  try {
    const aiServiceRes = await fetch('http://localhost:5002/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ api_details: req.body }),
    });

    if (!aiServiceRes.ok) {
      const errorText = await aiServiceRes.text();
      throw new Error(`AI service failed with status ${aiServiceRes.status}: ${errorText}`);
    }

    const testCases = await aiServiceRes.json();
    res.json(testCases);
  } catch (error) {
    console.error('Error connecting to AI service:', error);
    res.status(500).json({ error: 'Failed to connect to AI service' });
  }
});

app.post('/run-tests', async (req, res) => {
  const { testCases } = req.body;
  const results = [];
  const extractedVariables = {};

  try {
    for (const [index, testCase] of testCases.entries()) {
      const startTime = Date.now();
      let status = 'N/A';
      let responseBody = null;
      let passed = false;

      // Interpolate variables
      let url = testCase.url;
      let headers = testCase.headers;
      let body = testCase.body;

      for (const key in extractedVariables) {
        const placeholder = `{{${key}}}`;
        url = url.replace(new RegExp(placeholder, 'g'), extractedVariables[key]);
        headers = headers.replace(new RegExp(placeholder, 'g'), extractedVariables[key]);
        body = body.replace(new RegExp(placeholder, 'g'), extractedVariables[key]);
      }

      try {
        const parseHeaders = (headersString) => {
          if (!headersString || typeof headersString !== 'string') return {};
          try {
            return JSON.parse(headersString);
          } catch (e) {
            const parsed = {};
            headersString.split('\n').forEach(line => {
              const parts = line.split(':');
              if (parts.length >= 2) {
                const key = parts.shift().trim();
                const value = parts.join(':').trim();
                if (key) parsed[key] = value;
              }
            });
            return parsed;
          }
        };

        const parsedHeaders = parseHeaders(headers);
        // Automatically add Content-Type if body exists and it's not already set
        if (body && !parsedHeaders['Content-Type'] && !parsedHeaders['content-type']) {
          parsedHeaders['Content-Type'] = 'application/json';
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
          const instruction = JSON.parse(testCase.instruction);
          if (instruction.extract) {
            const { from = 'body', path, as } = instruction.extract;
            let source = from === 'body' ? responseBody : Object.fromEntries(response.headers.entries());
            if (source) {
              console.log('Source for JSONPath:', source);
              console.log('JSONPath object:', JSONPath);
              const extractedValue = JSONPath({ path, json: source, wrap: false });
              if (extractedValue) {
                extractedVariables[as] = extractedValue;
                console.log(`Extracted variable '${as}':`, extractedValue);
              }
            }
          }
        }
      } catch (error) {
        responseBody = { error: error.message };
        passed = false;
      }
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      results.push({
        description: testCase.description || `Test Case #${index + 1}`,
        url,
        method: testCase.method,
        passed,
        responseTime,
        status,
        payload: body,
        headers,
        response: responseBody,
      });
    }
    
    console.log("--- Sending Final Test Results to Frontend ---");
    console.log(JSON.stringify(results, null, 2));
    console.log('Final Test Results:', JSON.stringify(results, null, 2));
    res.json(results);

  } catch (error) {
    console.error("Error running tests:", error);
    res.status(500).json({ error: "Failed to run tests" });
  }
});

app.post('/generate-report', async (req, res) => {
  const { testCases, report } = req.body;
  console.log("Generating HTML report...");

  try {
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 400, height: 200 });
    const configuration = {
      type: 'bar',
      data: {
        labels: ['Passed', 'Failed'],
        datasets: [{
          label: '# of Tests',
          data: [report.passed, report.failed],
          backgroundColor: [
            'rgba(40, 167, 69, 0.2)',
            'rgba(220, 53, 69, 0.2)'
          ],
          borderColor: [
            'rgba(40, 167, 69, 1)',
            'rgba(220, 53, 69, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
    const image = await chartJSNodeCanvas.renderToDataURL(configuration);
    
    ejs.renderFile(__dirname + '/report_template.ejs', { testCases, report, chartImage: image }, (err, html) => {
      if (err) {
        console.error('Error rendering report:', err);
        return res.status(500).send('Error generating report');
      }
      res.send(html);
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

db.sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
}).catch(err => {
  console.error('Unable to sync database:', err);
});