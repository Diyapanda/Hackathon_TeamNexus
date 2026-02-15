import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Patient from './pages/Patient';
import Doctor from './pages/Doctor';
import Admin from './pages/Admin';
import Laboratory from './pages/Laboratory';
import Dashboard from './pages/lab-pages/Dashboard';
import UploadReports from './pages/lab-pages/UploadReports';
import TestsOverview from './pages/lab-pages/TestsOverview';
import Analytics from './pages/lab-pages/Analytics';
import ArchivePage from './pages/lab-pages/ArchivePage';
import LabProfile from './pages/lab-pages/LabProfile';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/patient" element={<Patient />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/admin" element={<Admin />} />

        <Route path="/laboratory" element={<Laboratory />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadReports />} />
          <Route path="tests" element={<TestsOverview />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="archive" element={<ArchivePage />} />
          <Route path="profile" element={<LabProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
