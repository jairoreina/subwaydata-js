import "@fontsource/ibm-plex-sans/400.css"  // Regular
import "@fontsource/ibm-plex-sans/500.css"  // Medium
import "@fontsource/ibm-plex-sans/600.css"  // Semi-bold
import "@fontsource/ibm-plex-sans/700.css"  // Bold
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import './index.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
