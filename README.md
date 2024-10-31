# Racing Visualizer

A web-based telemetry visualization tool for racing data, built with React and TypeScript.

## Features

- Interactive track map visualization using position data
- Real-time telemetry graphs showing:
  - Speed
  - Throttle
  - Brake
  - Gear
  - Steering angle
- Session-based data navigation
- Lap-by-lap analysis
- Support for both live and historical data

## Technology Stack

- React 18
- TypeScript
- Material-UI
- Recharts for data visualization
- GraphQL for data fetching
- Webpack for building

## Getting Started

### Prerequisites

- Node.js
- Yarn package manager

### Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
yarn install
```

### Development

Start the development server:
```bash
yarn start
```

### Production

Build for production:
```bash
yarn build:prod
```

Run production build locally:
```bash
yarn serve:prod
```

### Docker

Build and run with Docker:
```bash
yarn docker:build
yarn docker:run
```

## Data Structure

The application works with telemetry data points that include:
- Distance traveled
- Speed
- Throttle position
- Brake position
- Gear
- Steering angle
- Lap timing
- 3D position data (x, y, z coordinates)
- Vehicle rotation (yaw, pitch, roll)

## Services

### Telemetry Service

The application provides two implementations of the telemetry service:

1. **MockTelemetryService**: 
   - Used for development and testing
   - Provides simulated telemetry data
   - Includes sample lap data for testing visualizations

2. **ApiTelemetryService**:
   - Production service for real telemetry data
   - Connects to REST endpoints
   - Development endpoint: `/api`
   - Production endpoint: `https://b4mad.racing/api`

### Paddock Service

GraphQL-based service for session and game management:
- Connects to telemetry backend (`telemetry.b4mad.racing:30050/graphql`)
- Provides functionality to:
  - List available games
  - Fetch session information
  - Retrieve detailed session data including lap times
  - Query lap validity and timing data

The service automatically handles endpoint selection based on the environment:
- Development: Uses relative `/graphql` endpoint
- Production: Connects to `http://telemetry.b4mad.racing:30050/graphql`

## Scripts

- `yarn start` - Start development server
- `yarn build` - Build for production
- `yarn lint` - Run linting
- `yarn fetch-games` - Fetch available game sessions
- `yarn fetch-session` - Fetch specific session data
- `yarn fetch-sessions` - Fetch all sessions
