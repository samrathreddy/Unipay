const express = require('express');
const { FeeDetail } = require('./models'); // Adjust the path as needed
const router = express.Router();

// Check fee status
router.post('/v1/api/fee/check', async (req, res) => {
  const { rollNumber, year, semester, feeType } = req.body;

  try {
    // Find the fee details for the student
    const feeDetails = await FeeDetail.findOne({ rollNumber });

    if (feeDetails) {
      const yearDetail = feeDetails.fees.find(fee => fee.year === year);

      if (yearDetail) {
        if (feeType === 'busFeePaid' || feeType === 'yearFeePaid' || feeType === 'transportFeePaid') {
          res.status(200).json({ isPaid: yearDetail[feeType] });
        } else {
          const semesterDetail = yearDetail.semesters.find(sem => sem.semester === semester);

          if (semesterDetail && semesterDetail[feeType] !== undefined) {
            res.status(200).json({ isPaid: semesterDetail[feeType] });
          } else {
            res.status(404).json({ message: 'Semester or fee type not found' });
          }
        }
      } else {
        res.status(404).json({ message: 'Year not found' });
      }
    } else {
      res.status(404).json({ message: 'Fee details not found for the provided roll number' });
    }
  } catch (error) {
    console.error('Error checking fee option:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update fee status
router.post('/v1/api/fee/update', async (req, res) => {
  const { rollNumber, year, semester, feeType } = req.body;

  try {
    // Find the fee details for the student
    const feeDetails = await FeeDetail.findOne({ rollNumber });

    if (feeDetails) {
      const yearDetail = feeDetails.fees.find(fee => fee.year === year);

      if (yearDetail) {
        if (feeType === 'busFeePaid' || feeType === 'yearFeePaid' || feeType === 'transportFeePaid') {
          yearDetail[feeType] = true;
          await feeDetails.save();
          res.status(200).json({ message: 'Fee status updated successfully' });
        } else {
          const semesterDetail = yearDetail.semesters.find(sem => sem.semester === semester);

          if (semesterDetail && semesterDetail[feeType] !== undefined) {
            semesterDetail[feeType] = true;
            await feeDetails.save();
            res.status(200).json({ message: 'Fee status updated successfully' });
          } else {
            res.status(404).json({ message: 'Semester or fee type not found' });
          }
        }
      } else {
        res.status(404).json({ message: 'Year not found' });
      }
    } else {
      res.status(404).json({ message: 'Fee details not found for the provided roll number' });
    }
  } catch (error) {
    console.error('Error updating fee option:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
