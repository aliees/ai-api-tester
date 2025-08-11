# Plan: Implement "Import from cURL" Feature

This document outlines the plan to add an "Import from cURL" feature to the test case creation process in the `ai-api-tester` application.

## 1. Analysis of Existing Code

The primary files for this feature are:

*   `frontend/src/components/test-suites/TestSuiteBuilder.tsx`: This component allows users to manually build a test suite by adding individual test cases. This is the ideal location for the new feature.
*   `frontend/src/components/ApiForm.tsx`: This component already contains a cURL import and parsing function (`parseCurl`). This logic can be adapted and reused.

The current workflow in `TestSuiteBuilder.tsx` involves clicking "Add Test Case", which appends a blank test case form. The new feature will provide an alternative way to add a test case, pre-filled with data from a cURL command.

## 2. UI Changes

*   **New UI Element:** An "Import from cURL" button will be added to the `TestSuiteBuilder` component.
*   **Placement:** This button will be placed next to the existing "Add Test Case" button within the `button-group` div. This provides a clear choice to the user: add a blank test case or import one.
*   **Interaction:** Clicking the "Import from cURL" button will open a modal or a prompt asking the user to paste their cURL command.

```mermaid
graph TD
    A[User is on Test Suite Builder page] --> B{Wants to add a new test case};
    B --> C[Clicks "Add Test Case"];
    B --> D[Clicks "Import from cURL"];
    C --> E[A blank test case form is added];
    D --> F[Modal/Prompt appears];
    F --> G[User pastes cURL command and submits];
    G --> H[New test case form is added, pre-filled with data from cURL];
```

## 3. Implementation Logic

### cURL Parsing

A function similar to `parseCurl` in `ApiForm.tsx` will be created or adapted within `TestSuiteBuilder.tsx`. A robust approach would be to use a dedicated library like `curl-to-json` to handle the complexities of cURL command parsing. However, for this initial implementation, a regex-based approach similar to the existing one can be used.

The parsing logic will extract the following information:

*   **Method:** The HTTP method (e.g., `GET`, `POST`).
*   **URL:** The request URL.
*   **Headers:** Any request headers.
*   **Body:** The request body.

### Auto-filling the Form

1.  A new function, `handleImportFromCurl`, will be created in `TestSuiteBuilder.tsx`.
2.  This function will be called when the user submits the cURL command.
3.  Inside `handleImportFromCurl`, the parsing logic will be executed.
4.  The extracted data will be used to create a new test case object.
5.  This new test case object will be added to the `testCases` state using the `setTestCases` function.

The new test case will have its fields (URL, method, headers, body) pre-populated, and the user can then make any further adjustments before saving the entire test suite.

## 4. Switch to Implementation

Once this plan is approved, the next step is to switch to "Code" mode to implement the changes in `frontend/src/components/test-suites/TestSuiteBuilder.tsx`.