const express = require('express');
const validate = require('../models/rollDobModel');
const logEntry = require('../Utils/logUtil');
const validateInput = require('../Middlewares/validateInputMiddleware');

const router = express.Router();

router.post('/', async (req, res) => {
  const { rollNumber } = req.body;
  console.log("roll in")
  if (!validateInput(rollNumber)) {
    return res.status(400).json({ message: "Invalid roll number format." });
  }

  const log = `${new Date().toISOString()} - IP: ${req.ip}, Roll Number: ${rollNumber}\n`;
  logEntry('roll-number-log.txt', log);

  try {
    try {
      const students = await validate.find({}, 'Roll').limit(2); // Query for the first two documents and only retrieve the Roll field
      console.log("First two roll numbers:");
      students.forEach(student => console.log(student.Roll));
    } catch (error) {
      console.error("Error fetching student rolls:", error);
    }
  
    const student = await validate.findOne({ Roll: rollNumber });

    if (student) {
      return res.status(200).json({ message: 'Success' });
    } else {
      return res.status(404).json({ message: 'Roll number doesn\'t exist.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
