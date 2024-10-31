import React from 'react';
import RollNumberForm from './RollNumberForm';
import Container from './Container';
import Footer from './Footer';

function Home() {
  const scrollToSteps = () => {
    const container = document.querySelector('.container');
    container.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
    <div className="top-container">
      <header>
        <img src="trans.png" alt="" />
        <div className="center-nav">
          <a onClick={scrollToSteps} href="#">Steps</a>
          <a href="#">Why us?</a>
          <a href="#">Sales</a>
          <a href="#">Support</a>
        </div>
        <a href="#">Pay Now</a>
        <img className="hamburger" src="img/hamburger.svg" alt="Hamburger Icon" />
      </header>
      <div className="center-box">
        <h1>Time to clear your fees!!</h1>
        <p>Fees, transport, and fines within a few clicks. Why late then, drop your roll number and get the payment process started</p>
        <div className="nav-buttons">
          <RollNumberForm />
        </div>
      </div>
      <img className="cloud" src="img/cloud.svg" width="35px" alt="Cloud" />
    </div>
    <Container/>
    <Footer/>
    </div>
  );
}

export default Home;
