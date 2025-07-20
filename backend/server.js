const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Add a middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.post('/generate-tests', async (req, res) => {
  try {
    const aiServiceRes = await fetch('http://localhost:5001/generate', {
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

  try {
    const testPromises = testCases.map(async (testCase) => {
      const startTime = Date.now();
      let status = 'N/A';
      let responseBody = null;
      let passed = false;

      try {
        console.log("Headers sent to fetch:", testCase.headers);
        const parseHeaders = (headersString) => {
          if (!headersString || typeof headersString !== 'string') {
            return {};
          }
          try {
            return JSON.parse(headersString);
          } catch (e) {
            const headers = {};
            const lines = headersString.split('\n');
            for (const line of lines) {
              const parts = line.split(':');
              if (parts.length >= 2) {
                const key = parts.shift().trim();
                const value = parts.join(':').trim();
                if (key) {
                  headers[key] = value;
                }
              }
            }
            return headers;
          }
        };

        const response = await fetch(testCase.url, {
          method: testCase.method,
          headers: parseHeaders(testCase.headers),
          body: testCase.body || undefined,
        });

        status = response.status;
        const responseText = await response.text();
        
        try {
          responseBody = JSON.parse(responseText);
        } catch (e) {
          responseBody = responseText;
        }

        passed = status === parseInt(testCase.expectedStatus, 10);
      } catch (error) {
        responseBody = { error: error.message };
        passed = false;
      }
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        description: testCase.description || `Test Case #${index + 1}`,
        url: testCase.url,
        passed,
        responseTime,
        status,
        payload: testCase.body,
        headers: testCase.headers,
        response: responseBody,
      };
    });

    const results = await Promise.all(testPromises);
    
    console.log("--- Sending Final Test Results to Frontend ---");
    console.log(JSON.stringify(results, null, 2));
    res.json(results);

  } catch (error) {
    console.error("Error running tests:", error);
    res.status(500).json({ error: "Failed to run tests" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});