import React, { useState } from 'react';
import { RollNumberInput, DobInput, SubmitButton } from './FormInput'
import { handleRollNumberResponse, handleDobResponse } from './responseHandlers';

function RollNumberForm() {
  const [rollNumber, setRollNumber] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [rollNumberSubmitted, setRollNumberSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRollNumberSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/v1/api/roll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rollNumber }),
      });

      handleRollNumberResponse(response, setRollNumberSubmitted, setError);
    } catch (error) {
      setError('Error logging roll number on the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDobSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/v1/api/dob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rollNumber, dob }),
      });

      handleDobResponse(response, setError);
    } catch (error) {
      setError('Error logging DOB on the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={rollNumberSubmitted ? handleDobSubmit : handleRollNumberSubmit}>
      <RollNumberInput
        rollNumber={rollNumber}
        setRollNumber={setRollNumber}
        setRollNumberSubmitted={setRollNumberSubmitted}
        setDob={setDob}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {rollNumberSubmitted && <DobInput dob={dob} setDob={setDob} />}
      <SubmitButton loading={loading} rollNumberSubmitted={rollNumberSubmitted} />
    </form>
  );
}

export default RollNumberForm;
