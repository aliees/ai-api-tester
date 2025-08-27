# Project Overview

This document provides a comprehensive overview of the application's architecture, detailing the frontend, backend, and AI microservice components and how they interact to deliver a complete API testing solution.

## High-Level Summary

The application is composed of three main components: a React-based frontend, a Node.js backend, and a Python-based AI microservice. The user interacts with the **frontend** to manage API test suites and trigger test executions. The frontend communicates with the **backend** via a REST API to handle user authentication, data storage (test suites, test cases), and business logic. The backend, in turn, uses a PostgreSQL database to persist data.

For intelligent test case generation, the frontend can make requests to the standalone **AI microservice**. This service leverages the OpenAI API to dynamically generate test cases, security analyses, and improvement recommendations based on a given API endpoint. The generated data is then sent back to the frontend, which can then be saved as a new test suite via the backend.

---

## 1. Frontend Architecture

The frontend is built with React and TypeScript and is responsible for the user interface and user experience.

### Component Structure

The components are organized in the `frontend/src/components/` directory.

-   **`ApiTester.tsx`**: The main component for API testing functionality, including a request form, test case list, and results display.
-   **`TestSuitesPage.tsx`**: Allows users to create, edit, and run test suites.
-   **`Auth.tsx`**: Handles user authentication (login and registration).

### Application Entry Point & Routing

The application's entry point is `frontend/src/index.js`, which renders the main `App.tsx` component. Routing is handled via conditional rendering based on application state within `App.tsx`, rather than a dedicated routing library.

### State Management

The application primarily uses local component state with the `useState` hook. No global state management library like Redux or Context API is used.

---

## 2. Backend Architecture

The backend is built with Node.js, Express, and Sequelize ORM for PostgreSQL.

### Entry Point (`backend/server.js`)

The `backend/server.js` file initializes the Express server, integrates middleware (CORS, body-parser, request logger), connects to the database, and mounts the API routes. The server runs on port `3001`.

### API Routes

-   **/api/auth**:
    -   `POST /register`: Registers a new user and organization.
    -   `POST /login`: Authenticates a user and returns a JWT.
-   **/api/test-suites**: (Protected by JWT authentication)
    -   `GET /`: Retrieves all test suites for the user's organization.
    -   `POST /`: Creates a new test suite.
    -   `GET /:id`: Fetches a specific test suite.
    -   `PUT /:id`: Updates a test suite.
    -   `DELETE /:id`: Deletes a test suite.
    -   `POST /:id/run`: Executes a test suite.

### Database Models

Sequelize is used to manage the database schema.

-   **`Organization`**: A top-level entity with users and test suites.
-   **`User`**: Stores user credentials and belongs to an `Organization`.
-   **`TestSuite`**: A collection of test cases belonging to an `Organization`.
-   **`TestCase`**: An individual API test case belonging to a `TestSuite`.

### Middleware (`backend/middleware/auth.js`)

The `authenticateToken` middleware secures routes by verifying the JWT provided in the `Authorization` header.

---

## 3. AI Microservice Architecture

The AI microservice is a Python Flask application that provides intelligent test generation capabilities.

### Overview

The service uses the OpenAI API to dynamically generate test cases, provide security analysis, and offer improvement recommendations for a given API endpoint.

### Dependencies

-   **Flask**: Web framework for the API server.
-   **OpenAI**: Client library for the OpenAI API.
-   **requests**: To fetch a sample response from the target API.

### Application Logic

It exposes a single endpoint: `POST /generate`.

-   **Request Payload**: Requires the target API's URL, the number of test cases to generate, and a description.
-   **Workflow**:
    1.  Receives the API details.
    2.  Fetches a sample response from the target API URL.
    3.  Constructs a detailed prompt for the OpenAI `gpt-3.5-turbo` model, including the sample response as context.
    4.  Calls the OpenAI API.
    5.  Parses the JSON response from OpenAI.
    6.  Returns the generated test cases, security analysis, and recommendations to the client.

### Architecture Diagram

```mermaid
graph TD
    A[Frontend Client] -->|1. POST /generate with API details| B(AI Microservice);
    B -->|2. GET request to fetch sample| C(Target API);
    C -->|3. Sample Response| B;
    B -->|4. Generate Prompt| D(OpenAI API gpt-3.5-turbo);
    D -->|5. Generated Test Cases, Analysis, etc.| B;
    B -->|6. Return JSON Response| A;