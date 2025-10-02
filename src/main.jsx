import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.jsx'
import MicroorganismCharts from './microorganism-charts.jsx';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MicroorganismCharts />
  </StrictMode>
);
