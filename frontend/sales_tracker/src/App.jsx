// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/Auth/LoginPage'; // We will create this component next
import './index.css'; // Ensure your main Tailwind CSS file is imported here

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Routes>
          {/* Default route for the login page */}
          <Route path="/" element={<LoginPage />} />
          {/* Future routes will go here, e.g., /dashboard, /clients */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;