import React, { useState } from 'react';
import { RollNumberInput, DobInput, OptionInput, SubmitButton } from './FormInput';
import { handleRollNumberResponse, handleDobResponse, handleFeeTypeResponse } from './responseHandlers';
import { useNavigate } from 'react-router-dom';

function RollNumberForm() {
  const [rollNumber, setRollNumber] = useState('');
  const [dob, setDob] = useState('');
  const [option, setOption] = useState('');
  const [error, setError] = useState('');
  const [error1, setError1] = useState('');
  const [rollNumberSubmitted, setRollNumberSubmitted] = useState(false);
  const [dobSubmitted, setDobSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const handleRollNumberSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/v1/api/roll', {
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
      const response = await fetch('http://localhost:3000/v1/api/dob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rollNumber, dob }),
      });
      const data = await response.json();
      handleDobResponse(response, setDobSubmitted, setError1);
      if (response.ok) {
        setToken(data.token); // Store the JWT token
      }
    } catch (error) {
      setError1('Error logging DOB on the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeeTypeRequest = async () => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/v1/api/fee/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rollNumber, dob ,option}),
      });
      await handleFeeTypeResponse(response, setOption, setError);
      if (response.ok) {
        navigate('/form');
      }
    } catch (error) {
      setError('Error fetching fee type options.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!rollNumberSubmitted) {
      await handleRollNumberSubmit(event);
    } else if (rollNumberSubmitted && !dobSubmitted) {
      await handleDobSubmit(event);
    } else if (rollNumberSubmitted && dobSubmitted) {
      await handleFeeTypeRequest();
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <RollNumberInput
        rollNumber={rollNumber}
        setRollNumber={setRollNumber}
        setRollNumberSubmitted={setRollNumberSubmitted}
        setDob={setDob}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {rollNumberSubmitted && (
        <>
          <DobInput dob={dob} setDob={setDob} />
          {error1 && <p style={{ color: 'red' }}>{error1}</p>}
          {dobSubmitted && <OptionInput option={option} setOption={setOption} />}
        </>
      )}
      <SubmitButton loading={loading} rollNumberSubmitted={rollNumberSubmitted} dobSubmitted={dobSubmitted} />
    </form>
  );
}

export default RollNumberForm;
