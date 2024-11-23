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
  - Module Resolution: `Bundler` for compatibility with bundler tools like Webpack.
  - Lib: Includes `ES2020`, `DOM`, and `DOM.Iterable` for comprehensive ECMAScript and browser API support.
  - Strict Mode: Enabled (`"strict": true`) to enforce strict type checking and enhance code reliability.
  - No Unused Locals: Warnings for unused local variables to maintain clean code.
  - No Unused Parameters: Warnings for unused function parameters.
  - No Fallthrough Cases In Switch: Prevents unintended fall-through in switch statements.
  - Allow JS: Enabled (`"allowJs": true`) to include JavaScript files in the project, facilitating gradual migration to TypeScript.
  - ES Module Interop: Enabled (`"esModuleInterop": true`) for seamless interoperability between CommonJS and ES modules.
  - Use Define For Class Fields: Enabled (`"useDefineForClassFields": true`) for compliance with the latest ECMAScript proposals regarding class field declarations.
  - JSX Support: Set to `react-jsx` to enable the new JSX transform introduced in React 17+.
  - Isolated Modules: Enabled (`"isolatedModules": true`) to support transpilation processes like Babel.
  - Resolve JSON Modules: Enabled to allow importing JSON files directly into TypeScript modules.
  - Skip Lib Check: Enabled (`"skipLibCheck": true`) to speed up build times by skipping type checking of declaration files (`.d.ts`).
  - No Emit: Set to `false` to allow emitting compiled JavaScript files into the output directory.
  - Output Directory: `"outDir": "./dist"` specifies where compiled JavaScript files are outputted.
- Project Structure:
  - Root Configuration (`tsconfig.json`):
    - Uses project references to include `tsconfig.app.json` for better organization and scalability.
    - The `"files": []` property ensures no unintended files are included at the root level.
  - Application Configuration (`tsconfig.app.json`):
    - Extends the root configuration with specific settings for the application code under `src/`.
    - Includes all files within the `src` directory for compilation.
- Benefits of Configuration:
  - Enhanced Code Quality: Strict type checking and unused code warnings help maintain a clean and error-free codebase.
  - Modern JavaScript Features: Targeting `ES2020` and enabling modern features allow developers to write up-to-date and efficient code.
  - Tooling Compatibility: Settings like `moduleResolution` and `isolatedModules` ensure smooth integration with tools like Webpack and Babel.
  - Development Efficiency: Skipping library checks and enabling incremental builds improve development speed.

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
