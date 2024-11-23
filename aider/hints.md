 • Project Overview
   - **Racing Databox** is a web-based telemetry visualization tool for racing data, built with React and TypeScript.
   - Features include:
     - Interactive track map visualization using position data.
     - telemetry graphs showing speed, throttle, brake, gear, and steering angle.
     - Session-based data navigation with lap-by-lap analysis.
     - Support for both live and historical data.
   - Aims to provide racers and engineers with detailed insights into performance metrics and vehicle behavior.

 • Application Architecture
   - Built with **React 18** and **TypeScript**, following a modular and component-based architecture.
   - **Main Entry Point**: `src/main.tsx` renders the `App` component into the root DOM element.
   - **Root Component**: `src/App.tsx` sets up the application structure and routing using **React Router v6**.
   - **Context Providers** wrap the application to manage global state and services:
     - `ThemeProvider` for theming and styling.
     - `ErrorProvider` for centralized error handling.
     - `UIStateProvider` for managing UI-related state.
     - `SessionProvider` for session data management.
     - `TelemetryProvider` for telemetry data management.
   - **State Management**:
     - Utilizes **React Context** and custom hooks for state sharing across components.
     - **React Query** (`@tanstack/react-query`) handles data fetching, caching, and synchronization with server state.
   - **Data Visualization**:
     - Uses **Chart.js v4** with the zoom plugin for rendering interactive charts.
     - Components are designed to be reusable and composable for different visualization needs.
   - **UI Components**:
     - Employs **Material UI (MUI) v6** for UI components and theming consistency.
     - Custom theming is applied to match the application's branding and design requirements.
   - **Routing**:
     - Configured to handle deep links and navigation between sessions and analysis views.
     - Routes include:
       - `/sessions` for the session list and navigation.
       - `/session/:sessionId` for detailed session analysis.
   - **Build and Bundling**:
     - Configured with **Webpack** for module bundling and asset management.
     - Supports hot module replacement for development efficiency.
     - Production builds are optimized for performance and smaller bundle sizes.
   - **TypeScript Configuration**:
     - Enforces strict type checking for reliability and maintainability.
     - Uses modern ECMAScript features with target set to `ES2020`.
 • Data Models and Relationships
 • GraphQL Schema and API Endpoints
 • Component Hierarchy and Structure
 • State Management Practices
 • Routing and Navigation Details
 • Styling and Theming Guidelines
 • Code Style and Conventions
 • Common Design Patterns Used
 • Testing Strategies and Frameworks
 • Build and Deployment Process
 • Error Handling and Logging
 • Notes for AI Assistance

## Package Management
- Using yarn as package manager

## Key Dependencies
- React 18.x with TypeScript
- Material UI (MUI) v6 for components
- Chart.js v4 with zoom plugin for visualizations
- Apollo Client for GraphQL
- React Router v6 for routing

## Development Setup
- Webpack dev server runs on port 3000
- Proxies configured for API (/api) and GraphQL (/graphql) endpoints

## TypeScript Configuration
- Strict mode enabled
- Using ES2020 target
- React JSX mode
- Module resolution: Bundler

## Code Conventions
- TypeScript interfaces for all props and data types
- Functional components with hooks
- Material UI theming and styling
- Chart.js for all data visualizations

## URL State Management
- Custom useUrlState hook for managing state in URL parameters
- Handles serialization/deserialization of different data types
- Used for persisting zoom ranges and lap selection
- Provides shareable URLs that preserve visualization state
