We are using yarn as our package manager.

Chart.js Migration Notes:
1. Install dependencies:
   yarn remove recharts
   yarn add chart.js react-chartjs-2

2. Component Migration Order:
   - LineGraph.tsx (priority)
   - MapScatter.tsx
   
3. Key Steps:
   - Create new wrapper components
   - Transform data for Chart.js format
   - Implement Chart.js specific configurations
   - Test each component thoroughly

