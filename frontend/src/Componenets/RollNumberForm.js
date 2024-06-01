// import React, { useState } from 'react';
// import { RollNumberInput, DobInput, OptionInput, SubmitButton } from './FormInput'
// import { handleRollNumberResponse, handleDobResponse } from './responseHandlers';
// import {PopUp} from './index'; 

// function RollNumberForm() {
//   const [rollNumber, setRollNumber] = useState('');
//   const [dob, setDob] = useState('');
//   const [option, setOption] = useState('');
//   const [error, setError] = useState('');
//   const [rollNumberSubmitted, setRollNumberSubmitted] = useState(false);
//   const [dobSubmitted, setDobSubmitted] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showMultiForm, setShowMultiForm] = useState(false);


//   const handleRollNumberSubmit = async (event) => {
//     event.preventDefault();
//     setLoading(true);

//     try {
//       const response = await fetch('http://localhost:3000/roll', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ rollNumber }),
//       });

//       handleRollNumberResponse(response, setRollNumberSubmitted, setError);
//     } catch (error) {
//       setError('Error logging roll number on the server.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDobSubmit = async (event) => {
//     event.preventDefault();
//     setLoading(true);

//     try {
//       const response = await fetch('http://localhost:3000/v1/api/dob', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ rollNumber, dob }),
//       });
//       handleDobResponse(response,setDobSubmitted , setError);
//     } catch (error) {
//       setError('Error logging DOB on the server.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={rollNumberSubmitted ? handleDobSubmit : handleRollNumberSubmit}>
//       <RollNumberInput
//         rollNumber={rollNumber}
//         setRollNumber={setRollNumber}
//         setRollNumberSubmitted={setRollNumberSubmitted}
//         setDob={setDob}
//       />
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       {rollNumberSubmitted && (
//         <>
//           <DobInput dob={dob} setDob={setDob} />
//           {dobSubmitted && <OptionInput option={option} setOption={setOption} />}
//         </>
//       )}
//       <SubmitButton loading={loading} rollNumberSubmitted={rollNumberSubmitted} dobSubmitted={dobSubmitted} />
//     </form>
//   );
// }

// export default RollNumberForm;
import React, { useState } from 'react';
import { RollNumberInput, DobInput, OptionInput, SubmitButton } from './FormInput';
import { handleRollNumberResponse, handleDobResponse } from './responseHandlers';
import Home from './index.tsx';  // Adjust the import path as necessary

function RollNumberForm() {
  const [rollNumber, setRollNumber] = useState('');
  const [dob, setDob] = useState('');
  const [option, setOption] = useState('');
  const [error, setError] = useState('');
  const [rollNumberSubmitted, setRollNumberSubmitted] = useState(false);
  const [dobSubmitted, setDobSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMultiForm, setShowMultiForm] = useState(false); // State to track if the multi-step form should be shown

  const handleRollNumberSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/roll', {
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
      handleDobResponse(response, setDobSubmitted, setError);
    } catch (error) {
      setError('Error logging DOB on the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (event) => {
    if (rollNumberSubmitted) {
      handleDobSubmit(event);
    } else {
      handleRollNumberSubmit(event);
    }

    // If DOB is submitted, show the multi-step form
    if (rollNumberSubmitted && dobSubmitted) {
      setShowMultiForm(true);
    }
  };

  // If the multi-step form should be shown, render the Home component instead
  if (showMultiForm) {
    return <Home />;
  }

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
          {dobSubmitted && <OptionInput option={option} setOption={setOption} />}
        </>
      )}
      <SubmitButton loading={loading} rollNumberSubmitted={rollNumberSubmitted} dobSubmitted={dobSubmitted} />
    </form>
  );
}

export default RollNumberForm;

