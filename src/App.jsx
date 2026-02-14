import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Patient from './pages/Patient';
import Doctor from './pages/Doctor';
import Admin from './pages/Admin';
import Laboratory from './pages/Laboratory';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/patient" element={<Patient />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/laboratory" element={<Laboratory />} />
      </Routes>
    </Router>
  );
}

export default App;
