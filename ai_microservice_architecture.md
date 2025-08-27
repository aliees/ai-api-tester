# AI Microservice Architecture

This document outlines the architecture of the AI microservice.

## 1. Overview

The AI microservice is a Python-based application built with the Flask web framework. Its primary purpose is to dynamically generate test cases, provide security analysis, and offer improvement recommendations for a given API endpoint. It leverages the OpenAI API to generate this information.

## 2. Dependencies

The microservice relies on the following key Python libraries:

-   **Flask:** A lightweight web framework used to create the API server and define endpoints.
-   **Flask-Cors:** A Flask extension to handle Cross-Origin Resource Sharing (CORS), allowing the service to be called from a web frontend.
-   **OpenAI:** The official client library to interact with the OpenAI API, which is the core of the test case generation logic.
-   **python-dotenv:** Used for managing environment variables, specifically for securely loading the OpenAI API key.
-   **requests:** A standard HTTP client library used to fetch a sample response from the target API endpoint.

## 3. Application Logic

The application consists of a single API endpoint that orchestrates the test case generation process.

### API Endpoint: `POST /generate`

This is the sole endpoint exposed by the microservice.

-   **Request Payload:** It expects a JSON object containing details about the target API:
    -   `api_details`: An object containing:
        -   `url`: The URL of the API endpoint to be tested.
        -   `numTestCases`: The desired number of test cases to generate.
        -   `description`: A brief description of the API's purpose.

-   **Core Workflow:**
    1.  **Receive Request:** The endpoint receives the API details from the client.
    2.  **Fetch Sample Response:** It makes a `GET` request to the provided `url` to obtain a sample JSON response. This response is used as context for the AI model.
    3.  **Construct Prompt:** A detailed prompt is constructed for the OpenAI `gpt-3.5-turbo` model. The prompt includes the API URL, description, the number of test cases, the sample response, and specific instructions for the desired JSON output format.
    4.  **Call OpenAI API:** The prompt is sent to the OpenAI API.
    5.  **Process Response:** The response from OpenAI, which contains the generated test cases, security analysis, and recommendations in a JSON format, is received. The application includes logic to parse this JSON, even if it's embedded within markdown code blocks.
    6.  **Return to Client:** The final JSON object is returned to the client.

## 4. Architecture Diagram

```mermaid
graph TD
    A[Client] -->|1. POST /generate with API details| B(AI Microservice);
    B -->|2. GET request to fetch sample| C(Target API);
    C -->|3. Sample Response| B;
    B -->|4. Generate Prompt| D(OpenAI API gpt-3.5-turbo);
    D -->|5. Generated Test Cases, Security Analysis, Recommendations| B;
    B -->|6. Return JSON Response| A;