import React from 'react';
import { useNavigate } from 'react-router-dom';

export function RollNumberInput({ rollNumber, setRollNumber, setRollNumberSubmitted, setDob }) {
  return (
    <>
      <input
        className="input-field"
        type="text"
        placeholder="Drop your roll number"
        minLength={5}
        maxLength={12}
        required
        value={rollNumber}
        onChange={(e) => {
          setRollNumber(e.target.value);
          setRollNumberSubmitted(false);
          setDob('');
        }}
      />
      <br /><br />
    </>
  );
}

export function DobInput({ dob, setDob }) {
  return (
    <>
      <input
        className="input-field"
        type="date"
        placeholder="Choose your DOB"
        required
        value={dob}
        onChange={(e) => setDob(e.target.value)}
      />
      <br /><br />
    </>
  );
}

export function OptionInput({ option, setOption }) {
  return (
    <div className="option-input">
      <select id="option" value={option} onChange={(e) => setOption(e.target.value)}>
        <option value="" disabled>Choose your fee type</option>
        <option value="reg">College Fee</option>
        <option value="tra">Transport</option>
        <option value="regexam">Exam Fee</option>
        <option value="supexam">Supplementary Fee</option>
        <option value="reexam">Re-evaluation fee</option>
        <option value="fine">Fines</option>
      </select>
    </div>
  );
}

export function SubmitButton({ loading, rollNumberSubmitted, dobSubmitted }) {
  return (
    <button className="submit-button" type="submit" disabled={loading}>
      {loading ? 'Loading...' : (rollNumberSubmitted ? (dobSubmitted ? 'Pay' : 'Submit Dob') : 'Submit Roll Number')}
    </button>
  );
}