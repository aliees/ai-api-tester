# Backend Architecture Documentation

This document provides a comprehensive overview of the backend architecture of the application.

## 1. Entry Point (`backend/server.js`)

The main entry point of the backend is `backend/server.js`. This file is responsible for:

-   **Initializing the Express Server:** It sets up an Express application to handle incoming HTTP requests.
-   **Middleware Integration:** The server uses several middleware components:
    -   `cors`: Enables Cross-Origin Resource Sharing to allow requests from the frontend.
    -   `body-parser`: Parses incoming request bodies in JSON format.
    -   **Request Logger:** A custom middleware is implemented to log the method and URL of every incoming request, which is valuable for debugging and monitoring.
-   **Route Handling:** It imports and mounts the application's routes:
    -   `/api/auth`: Handles authentication-related endpoints.
    -   `/api/test-suites`: Manages test suite operations.
-   **Database Connection:** The server connects to a PostgreSQL database using Sequelize and synchronizes the data models before starting.
-   **Server Activation:** It starts the server on port `3001` by default, which can be configured via environment variables.

## 2. API Routes

The backend exposes the following API endpoints:

### Authentication (`/api/auth`)

-   `POST /register`: Allows new users to register by creating a new organization and a user account associated with it.
-   `POST /login`: Authenticates existing users and returns a JSON Web Token (JWT) for securing subsequent requests.

### Test Suites (`/api/test-suites`)

All endpoints under this path are protected and require a valid JWT.

-   `GET /`: Retrieves a list of all test suites belonging to the authenticated user's organization.
-   `POST /`: Creates a new test suite with a set of associated test cases.
-   `GET /:id`: Fetches the details of a specific test suite by its ID.
-   `PUT /:id`: Updates the information of an existing test suite, including its test cases.
-   `DELETE /:id`: Deletes a test suite and its associated test cases.
-   `POST /:id/run`: Executes all test cases within a specified test suite and returns the results.

## 3. Database Models

The application uses Sequelize as an Object-Relational Mapper (ORM) to manage the database schema and interactions. The models are defined as follows:

-   **`Organization`**: Represents a user's organization. It has a one-to-many relationship with the `User` and `TestSuite` models.
-   **`User`**: Stores user information, including a hashed password for security. Each user belongs to an `Organization`.
-   **`TestSuite`**: Represents a collection of test cases. Each test suite belongs to an `Organization`.
-   **`TestCase`**: Defines an individual test case with properties such as URL, HTTP method, headers, body, and expected status code. Each test case is part of a `TestSuite`.

The relationships between these models are established in `backend/models/index.js`, which centralizes the model definitions and associations.

## 4. Database Configuration (`backend/config/database.js`)

The database connection is configured in `backend/config/database.js`.

-   **Database Driver:** The application uses the `pg` driver to connect to a PostgreSQL database.
-   **Environment Variables:** Connection parameters such as the database name, user, and password are managed through environment variables for better security and flexibility.
-   **Sequelize Instance:** This file exports a configured Sequelize instance that is used throughout the application to interact with the database.

## 5. Middleware (`backend/middleware/auth.js`)

The `authenticateToken` middleware is responsible for securing the application's routes.

-   **JWT Verification:** It extracts the JWT from the `Authorization` header of incoming requests and verifies its authenticity.
-   **User Context:** If the token is valid, it decodes the user's information and attaches it to the request object, making it available to downstream route handlers.
-   **Access Control:** This ensures that only authenticated users can access protected endpoints, such as those for managing test suites.

This architecture provides a solid foundation for the application, with a clear separation of concerns and a secure authentication mechanism.