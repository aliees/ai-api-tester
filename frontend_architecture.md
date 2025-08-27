# Frontend Architecture

This document provides an overview of the frontend architecture of the application.

## Component Structure

The frontend is built with React and TypeScript, and the components are organized in the `frontend/src/components/` directory. The main components are:

- **`ApiTester.tsx`**: This is the main component for the API testing functionality. It includes a form to send requests, a list of test cases, and a display for the results.
- **`TestSuitesPage.tsx`**: This component allows users to create, edit, and run test suites. It includes a list of test suites and a builder to create new ones.
- **`Auth.tsx`**: This component handles user authentication, including login and registration.

## Application Entry Point

The application's entry point is `frontend/src/index.js`, which renders the main `App.tsx` component. The `App.tsx` component, in turn, renders the `ApiTester.tsx`, `TestSuitesPage.tsx`, or `Auth.tsx` component based on the user's authentication status and the active tab.

## Routing

The application does not use a dedicated routing library like React Router. Instead, it uses conditional rendering based on the `activeTab` state in the `App.tsx` component to switch between the API Tester and Test Suites pages.

## State Management

The application primarily uses local component state with the `useState` hook to manage the state of the components. There is no evidence of a global state management library like Redux or the use of React Context for state management.