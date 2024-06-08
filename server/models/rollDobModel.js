const { Console } = require('console');
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  Roll: String,
  DOB: String
});

const validate = mongoose.model('2021students', studentSchema);


module.exports = validate;
