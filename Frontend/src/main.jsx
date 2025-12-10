// Core React imports
import React from 'react'
import { createRoot } from 'react-dom/client'
// Main app component
import App from './App'
// Global styles - includes Tailwind CSS and custom styling
import './styles.css'

// Mount the React application to the DOM
// StrictMode helps identify potential issues in development
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
