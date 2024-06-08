const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  semester: Number,
  isExamPaid: { type: Boolean, default: false },
  isRevaluationPaid: { type: Boolean, default: false },
  isSupplementaryPaid: { type: Boolean, default: false },
});

const feeDetailSchema = new mongoose.Schema({
  year: String,
  busFeePaid: { type: Boolean, default: false },
  busFeeAmount: { type: Number, required: true },
  yearFeePaid: { type: Boolean, default: false },
  yearFeeAmount: { type: Number, required: true },
  transportFeePaid: { type: Boolean, default: false },
  transportFeeAmount: { type: Number, required: true },
  semesters: [semesterSchema],
});

const feeSchema = new mongoose.Schema({
  Roll : String,
  fees : [feeDetailSchema],
});

const studentSchema = new mongoose.Schema({
  Roll : String,
  Name: String,
  DOB: Date,
  Branch : String,
  Student_Mobile_No : Number,
  student_mail_id : String,
});

const FeeDetail = mongoose.model('2021fee', feeSchema);
const Student = mongoose.model('2021students', studentSchema);

module.exports = { FeeDetail, Student };
