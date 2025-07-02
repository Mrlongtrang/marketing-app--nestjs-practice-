import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LEADSPage from './Pages/LEADSPage';
import LeadDetailPage from './Pages/LeadDetailPage';
import LoginForm from './Pages/loginForm'; 
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} /> 
        <Route path="/" element={<LEADSPage />} />
        <Route path="/leads/:id" element={<LeadDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
