## Project Overview
   - Racing Databox is a web-based telemetry visualization tool for racing data, built with React and TypeScript.
   - Features include:
     - Interactive track map visualization using position data.
     - telemetry graphs showing speed, throttle, brake, gear, and steering angle.
     - Session-based data navigation with lap-by-lap analysis.
     - Support for both live and historical data.
   - Aims to provide racers and engineers with detailed insights into performance metrics and vehicle behavior.

## Application Architecture
   - Built with React 18 and TypeScript, following a modular and component-based architecture.
   - Main Entry Point: `src/main.tsx` renders the `App` component into the root DOM element.
   - Root Component: `src/App.tsx` sets up the application structure and routing using React Router v6.
   - Context Providers wrap the application to manage global state and services:
     - `ThemeProvider` for theming and styling.
     - `ErrorProvider` for centralized error handling.
     - `UIStateProvider` for managing UI-related state.
     - `SessionProvider` for session data management.
     - `TelemetryProvider` for telemetry data management.
   - State Management:
     - Utilizes React Context and custom hooks for state sharing across components.
     - React Query (`@tanstack/react-query`) handles data fetching, caching, and synchronization with server state.
   - Data Visualization:
     - Uses Chart.js v4 with the zoom plugin for rendering interactive charts.
     - Components are designed to be reusable and composable for different visualization needs.
   - UI Components:
     - Employs Material UI (MUI) v6 for UI components and theming consistency.
     - Custom theming is applied to match the application's branding and design requirements.
   - Routing:
     - Configured to handle deep links and navigation between sessions and analysis views.
     - Routes include:
       - `/sessions` for the session list and navigation.
       - `/session/:sessionId` for detailed session analysis.
   - Build and Bundling:
     - Configured with Webpack for module bundling and asset management.
     - Supports hot module replacement for development efficiency.
     - Production builds are optimized for performance and smaller bundle sizes.
   - TypeScript Configuration:
     - Enforces strict type checking for reliability and maintainability.
     - Uses modern ECMAScript features with target set to `ES2020`.

## Key Dependencies

- React: Version 18.x, used for building the user interface.
- TypeScript: For type-safe coding and enhanced code reliability.
- Yarn: For package management and dependency resolution.
- Material-UI (MUI): Version 6.x, employed for UI components and theming.
- React Router: Version 6.x, for client-side routing and navigation.
- @tanstack/react-query: Version 5.x, utilized for data fetching, caching, and synchronization with server state.
- Chart.js: Version 4.x, with the zoom plugin, for rendering interactive charts and graphs.
- React Chart.js 2: For integrating Chart.js with React components.
- GraphQL: Utilized via Apollo Client for efficient data fetching and state management.
- Webpack: For module bundling, asset management, and building the application.
- Babel: For transpiling modern JavaScript and TypeScript to code compatible with the target environments.
- ESLint: For linting and maintaining code quality and consistency.
- Jest: For running unit tests and ensuring code correctness.
- Docker: For containerization, facilitating consistent deployment environments.

## TypeScript Configuration

- Compiler Options:
  - Target: Set to `ES2020` to utilize modern JavaScript features.
  - Module: `ESNext` to support the latest module syntax and dynamic imports.
  - Strict Mode: Enabled (`"strict": true`) to enforce strict type checking.
  - ES Module Interop: Enabled (`"esModuleInterop": true`) for interoperability between CommonJS and ES modules.
  - JSX Support: Set to `react-jsx` for React JSX transform.

## Directory Structure and Architectural Patterns

- **`src/components`**
  - Contains reusable UI components.
  - Follows the **Component-Based Architecture** pattern, promoting reusability and modularity.
  - Components are organized by functionality and can be composed to build complex interfaces.

- **`src/contexts`**
  - Implements React Contexts for global state management.
  - Follows the **Context API** pattern to provide shared state across the component tree without prop drilling.
  - Includes context providers like `ThemeContext`, `ErrorContext`, `UIStateContext`, `SessionContext`, and `TelemetryContext`.

- **`src/providers`**
  - Contains higher-order components and context providers that encapsulate related logic.
  - Implements the **Provider Pattern** to supply dependencies and services to the application.
  - Includes providers like `QueryProvider` and `QueryParamProvider` for managing React Query configurations and URL query parameters.

- **`src/hooks`**
  - Contains custom React hooks.
  - Utilizes the **Custom Hooks Pattern** to encapsulate reusable logic and side effects.
  - Hooks abstract complex functionalities like error handling (`useErrorHandler`).

- **`src/services`**
  - Contains service classes and utilities for data fetching and API interactions.
  - Follows the **Service Layer Pattern** to separate business logic and data access from UI components.
  - Includes services like `PaddockService` for interacting with GraphQL APIs.

- **`src/views`**
  - Contains page-level components corresponding to different routes.
  - Applies the **Page Component Pattern** where each view manages its own state and data fetching.
  - Views include `AnalysisView` and `SessionsView` for different parts of the application.

- **`src/theme`**
  - Contains theming configurations and custom styling.
  - Implements the **Theming Pattern** for consistent styling across the application.
  - Customizes Material-UI themes to match the application's branding.

- **`src/utils`** *(If present)*
  - Houses utility functions and helper modules.
  - Follows the **Utility Module Pattern** for shared helper functions and constants.

- **`src/App.tsx`**
  - The root component that sets up the application structure and routing.
  - Uses React Router for navigation and wraps the app with various context providers.

- **`src/index.tsx`**
  - The entry point of the application.
  - Renders the `App` component into the DOM.

## Data Models and Relationships
## GraphQL Schema and API Endpoints
## Component Hierarchy and Structure
## State Management Practices
## Routing and Navigation Details
## Styling and Theming Guidelines
## Code Style and Conventions
## Common Design Patterns Used
## Testing Strategies and Frameworks
## Build and Deployment Process
## Error Handling and Logging
## Notes for AI Assistance
