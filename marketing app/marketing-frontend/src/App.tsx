import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LEADSPage from './LEADSPage';
import LeadDetailPage from './LeadDetailPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LEADSPage />} />
        <Route path="/leads/:id" element={<LeadDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;