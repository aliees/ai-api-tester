# Project Documentation: AI-Powered API Tester

## 1. High-Level Overview

This project is a web-based API testing tool that leverages artificial intelligence to automatically generate test cases. It is designed to simplify the API testing process by allowing users to input an API's details and receive a comprehensive set of test cases, including positive, negative, and edge cases. The application then allows the user to execute these tests and view a detailed report of the results.

The primary goal of this tool is to accelerate the testing cycle and improve test coverage by automating the often time-consuming task of writing test cases.

## 2. Architecture

The application is built on a multi-tenant SaaS architecture, designed for scalability and security. It consists of a frontend, a backend, an AI microservice, and a PostgreSQL database.

```mermaid
graph TD;
    subgraph "User Interface"
        A[Frontend (React/TypeScript)];
    end

    subgraph "Backend Services"
        B(Backend (Node.js/Express));
        C(AI Microservice (Python/Flask));
        D[PostgreSQL Database];
    end

    subgraph "External Services"
        E(OpenAI);
        F(Target API);
    end

    A -->|HTTP Request with JWT| B;
    B -->|CRUD Operations| D;
    B -->|HTTP Request| C;
    C -->|OpenAI API Call| E;
    E -->|Generated Test Cases| C;
    C -->|Test Cases| B;
    B -->|Test Cases| A;
    A -->|Run Tests Request| B;
    B -->|Executes Tests| F;
    F -->|Test Results| B;
    B -->|Test Results| A;
```

## 3. Component Breakdown

### Frontend

The frontend is a single-page application built with **React** and **TypeScript**. It provides a user-friendly interface for interacting with the API tester. The main components are:

*   **`ApiTester.tsx`**: The main component that orchestrates the entire user interface. It manages the state for test cases, execution logs, and test reports.
*   **`ApiForm.tsx`**: A form where users can input the details of the API they want to test, including the URL, method, headers, body, and a description of the API.
*   **`TestCasesList.tsx`**: Displays the AI-generated test cases in a clear, tabular format.
*   **`ExecutionLogs.tsx`**: Shows a log of events, such as the generation of test cases, the start and end of test runs, and any errors that occur.
*   **`ReportCard.tsx`**: Presents a summary of the test results, including the total number of tests, the number of passed and failed tests, and the average response time.

### Backend

The backend is a **Node.js** application using the **Express** framework. It serves as a bridge between the frontend and the AI microservice, and is responsible for executing the test cases.

*   **`server.js`**: The entry point of the backend application. It defines the following API endpoints:
    *   `POST /api/auth/register`: Registers a new user and organization.
    *   `POST /api/auth/login`: Logs in a user and returns a JWT.
    *   `POST /api/test-suites`: Creates a new test suite.
    *   `GET /api/test-suites`: Retrieves all test suites for the user's organization.
    *   `GET /api/test-suites/:id`: Retrieves a single test suite.
    *   `PUT /api/test-suites/:id`: Updates a test suite.
    *   `DELETE /api/test-suites/:id`: Deletes a test suite.
    *   `POST /generate-tests`: Receives API details from the frontend, forwards them to the AI microservice to generate test cases, and then returns the test cases to the frontend.
    *   `POST /run-tests`: Receives a list of test cases from the frontend, executes each one against the target API, and returns the results.

### AI Microservice

The AI microservice is a **Python** application built with the **Flask** framework. Its sole responsibility is to generate test cases using a large language model.

*   **`app.py`**: The main file for the microservice. It exposes a single endpoint:
    *   `POST /generate`: Receives API details from the backend, makes a sample `GET` request to the target API to get a real response, and then uses that response to construct a more context-aware prompt for the OpenAI API. It then returns a list of generated test cases.

## 4. Data Flow

### Generating Test Cases

1.  The user fills out the API details in the `ApiForm` component and clicks "Send Request".
2.  The `ApiTester` component sends a `POST` request to the backend's `/generate-tests` endpoint.
3.  The backend forwards the request to the AI microservice's `/generate` endpoint.
4.  The AI microservice makes a `GET` request to the user-provided API URL to fetch a sample response.
5.  The AI microservice calls the OpenAI API with a carefully crafted prompt that includes the sample response.
6.  The OpenAI API returns a list of test cases, which the AI microservice then sends back to the backend.
7.  The backend returns the test cases to the frontend.
8.  The `TestCasesList` component displays the generated test cases to the user.

### Running Tests

1.  The user clicks the "Run Tests" button in the `TestCasesList` component.
2.  The `ApiTester` component sends a `POST` request to the backend's `/run-tests` endpoint with the list of test cases.
3.  The backend iterates through the test cases, executing each one against the specified target API.
4.  The backend collects the results of each test, including the status code, response body, and response time.
5.  The backend returns the results to the frontend.
6.  The `ApiTester` component displays the detailed results, and the `ReportCard` component shows a summary of the test run.
### Importing Test Cases from CSV

In addition to generating test cases with AI, you can also import your own test cases from a CSV file.

1.  **Create a CSV file** with the following headers: `url`, `method`, `headers`, `body`, and `expectedStatus`.
2.  **Click the "Choose File" button** in the "API Request" section of the application.
3.  **Select your CSV file.** The test cases will be automatically loaded into the "Generated Test Cases" table.
4.  **Click the "Run Tests" button** to execute the imported test cases.
### Chaining Requests with Instructions

The application supports chaining API requests, allowing you to extract a value from the response of one test case and use it in a subsequent test case. This is useful for testing workflows that require authentication or passing data between endpoints.

**Instruction Format:**

To use this feature, add an `instruction` column to your CSV file. The value of this column should be a JSON string with the following format:

```json
{"extract": {"from": "body", "path": "$.token", "as": "authToken"}}
```

*   `extract`: The action to perform.
*   `from`: Where to look for the value (`body` or `header`).
*   `path`: The [JSONPath](https://jsonpath.com/) to the specific value. `$` represents the root of the JSON response.
*   `as`: The name of the variable to save the value as (e.g., `authToken`).

**Using Extracted Variables:**

In a subsequent test case, you can use the extracted variable in the `url`, `headers`, or `body` fields using the `{{variable_name}}` syntax.

**Example:**

1.  **Login and Extract Token:**
    *   **url:** `https://yourapi.com/login`
    *   **method:** `POST`
    *   **body:** `{"username": "user", "password": "password"}`
    *   **instruction:** `{"extract": {"from": "body", "path": "$.token", "as": "authToken"}}`

2.  **Access a Protected Resource:**
    *   **url:** `https://yourapi.com/data`
    *   **method:** `GET`
    *   **headers:** `{"Authorization": "Bearer {{authToken}}"}`
### Downloading Reports

The application provides two options for downloading test reports:

*   **JSON Report**: A raw JSON file containing the detailed results of the test run.
*   **HTML Report**: A professional, self-contained HTML file with a summary of the test results, a chart visualizing the passed and failed tests, and a detailed breakdown of each test case.

## 5. Getting Started

To run the application on your local machine, follow these steps:

### Prerequisites

*   Node.js and npm
*   Python and pip
*   PostgreSQL
*   An OpenAI API key

### Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    ```

4.  **AI Microservice Setup:**
    ```bash
    cd ../ai-microservice
    pip install -r requirements.txt
    ```

5.  **Configure OpenAI API Key:**
    Create a `.env` file in the `ai-microservice` directory and add your OpenAI API key:
    ```
    OPENAI_API_KEY='your-openai-api-key'
    ```

### Running the Application

1.  **Start the Backend Server:**
    ```bash
    cd backend
    npm start
    ```

2.  **Start the Frontend Development Server:**
    ```bash
    cd ../frontend
    npm start
    ```

3.  **Start the AI Microservice:**
    ```bash
    cd ../ai-microservice
    python3 -m flask run --port 5001
    ```

Once all three services are running, you can access the application in your web browser at `http://localhost:3000`.