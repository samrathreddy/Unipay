const express = require('express');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests, please try again after 15 minutes."
    });
  }
});

app.use(express.json());
app.use(cors());

// Apply rate limiting middleware to specific routes
app.use(['/v1/api/roll', '/v1/api/dob'], limiter);

// Input validation function to prevent script injection
const validateInput = (input) => /^[a-zA-Z0-9]*$/.test(input); // Only allow alphanumeric characters

// Endpoint to handle roll number validation
app.post('/roll', (req, res) => {
  const { rollNumber } = req.body;

  // Validate roll number to prevent script injection
  if (!validateInput(rollNumber)) {
    return res.status(400).json({ message: "Invalid roll number format." });
  }

  const logEntry = `${new Date().toISOString()} - IP: ${req.ip}, Roll Number: ${rollNumber}\n`; // Include IP address in log entry

  fs.appendFile(path.join(__dirname, 'roll-number-log.txt'), logEntry, (err) => {
    if (err) {
      console.error('Error appending to log file:', err);
      return res.status(500).json({ message: 'Error appending to log file' });
    } else {
      if (rollNumber === '21B81A05V9') {
        console.log('Roll number logged successfully:', rollNumber);
        return res.status(200).json({ message: 'Success' });
      } else {
        console.log('Roll number doesn\'t exist:', rollNumber);
        return res.status(404).json({ message: 'Roll number doesn\'t exist.' });
      }
    }
  });
});

// Endpoint to handle DOB submission
app.post('/v1/api/dob', (req, res) => {
  const { rollNumber, dob } = req.body;

  // Validate roll number to prevent script injection
  if (!validateInput(rollNumber)) {
    return res.status(400).json({ message: "Invalid roll number format." });
  }

  const logEntry = `${new Date().toISOString()} - IP: ${req.ip}, Roll Number: ${rollNumber}, DOB: ${dob}\n`; // Include IP address and DOB in log entry

  fs.appendFile(path.join(__dirname, 'dob-log.txt'), logEntry, (err) => {
    if (err) {
      console.error('Error appending to log file:', err);
      return res.status(500).json({ message: 'Error appending to log file' });
    } else {
      if(dob === '2024-05-10'){
        console.log('DOB logged successfully:', rollNumber, dob);
        return res.status(200).json({ message: 'Success' });
      } else {
        console.log('DOB does not match:', rollNumber, dob);
        return res.status(404).json({ message: 'DOB does not match' });
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
