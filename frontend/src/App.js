// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Header from './components/Header';   // ✅ Import Header
import Footer from './components/Footer';   // ✅ Import Footer

import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import UploadReceipt from './components/UploadReceipt';
import CalendarTab from './components/CalendarTab';

import Dashboard from './components/Dashboard';
import BudgetPlanner from './components/BudgetPlanner'; // adjust the path if needed


function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />  {/* ✅ Header visible on all pages */}

        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadReceipt />} />
            <Route path="/budget-planner" element={<BudgetPlanner />} />
            <Route path="/calendar" element={<CalendarTab />} />
          </Routes>
        </div>

        <Footer />  {/* ✅ Footer visible on all pages */}
      </div>
    </Router>
  );
}

export default App;
