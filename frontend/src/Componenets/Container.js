import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Container() {
  useEffect(() => {
    AOS.init({
      offset: 400,
      duration: 1000
    });
  }, []);

  return (
    <div>
      <div className="container" data-aos="fade-up">
        <img className="container-img" src="img/container-1.svg" alt="Container 1" />
        <div className="description">
          <h2>Enter Your Roll Number and Date of Birth</h2>
          <p>Provide your roll number and date of birth to authenticate your identity and access your payment details. This simple step ensures the security and privacy of your information.</p>
        </div>
      </div>

      <div className="container2" data-aos="fade-up">
        <div className="description">
          <h2>Choose your Fee</h2>
          <p>Select the type of fee you need to pay, whether it's for transportation, regular tuition, exams, or fines. Our platform makes the process quick and simple.</p>
        </div>
        <img className="container-img" src="img/container-2.svg" alt="Container 2" />
      </div>

      <div className="container2-mobile" data-aos="fade-up">
        <img className="container-img" src="img/container-2.svg" alt="Container 2" />
        <div className="description">
          <h2>Choose your Fee</h2>
          <p>Select the type of fee you need to pay, whether it's for transportation, regular tuition, exams, or fines. Our platform makes the process quick and simple.</p>
        </div>
      </div>

      <div className="container" data-aos="fade-up">
        <img className="container-img" src="img/container-3.svg" alt="Container 3" />
        <div className="description">
          <h2>Verify Your Details Before Payment</h2>
          <p>Great! We will display the information we have on record for you. Please ensure that all details are correct before proceeding with your payment.</p>
        </div>
      </div>

      <div className="bottom-container" data-aos="fade-up">
        <div className="description">
          <h2>Reliable tech for staying close</h2>
          <p>Low-latency voice and video feels like you’re in the same room. Wave hello over video, watch friends stream their games, or gather up and have a drawing session with screen share.</p>
        </div>
        <img src="img/container-4.svg" alt="Container 4" />
      </div>

      <div className="last-message">
        <h4>Ready to join with us?</h4>
        <a href="/contact">Contact Us</a>
      </div>
    </div>
  );
}
