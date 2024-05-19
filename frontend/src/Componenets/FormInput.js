import React from 'react';

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

export function SubmitButton({ loading, rollNumberSubmitted }) {
    return (
      <button className="submit-button" type="submit" disabled={loading}>
        {loading ? 'Loading...' : (rollNumberSubmitted ? 'Submit DOB' : 'Submit Roll Number')}
      </button>
    );
}

