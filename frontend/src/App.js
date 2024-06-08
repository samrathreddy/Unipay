import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Form } from 'react-router-dom';
import Formfill from './Componenets/Formfill.tsx';
import Home from './Componenets/Home';
import './App.css';

function AppContent() {
  
  const location = useLocation();
  const isHomePage = location.pathname === '/home';

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<Formfill />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
