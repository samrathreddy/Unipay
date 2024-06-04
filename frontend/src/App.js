import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import RollNumberForm from './Componenets/RollNumberForm';
import Home from './Componenets/index.tsx';
import Header from './Componenets/Header';
import Container from './Componenets/Container';
import Footer from './Componenets/Footer';
import './App.css';

function AppContent() {
  
  const location = useLocation();
  const isHomePage = location.pathname === '/home';

  return (
    <div className="App">
      {!isHomePage && <Header />}
      <Routes>
        <Route path="/" element={<RollNumberForm />} />
        <Route path="/home" element={<Home />} />
      </Routes>
      <Container />
      <Footer />
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
