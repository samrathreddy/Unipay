export const handleRollNumberResponse = async (response, setRollNumberSubmitted, setError) => {
    if (response.ok) {
      setRollNumberSubmitted(true);
      setError('');
    } else if (response.status === 429) {
      setError('Too many attempts, please try again after 15 minutes.');
    } else {
      const responseData = await response.json();
      setError(responseData.message || 'Roll number doesn\'t exist.');
      setRollNumberSubmitted(false);
    }
  };
  
  export const handleDobResponse = async (response, setDobSubmitted , setError) => {
    if (response.ok) {
      setDobSubmitted(true);
      setError('');
    } else if (response.status === 429) {
      setError('Too many attempts, please try again after 15 minutes.');
    } else {
      const responseData = await response.json();
      setError(responseData.message || 'Error logging DOB.');
    }
  };
  