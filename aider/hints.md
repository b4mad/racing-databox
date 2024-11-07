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
