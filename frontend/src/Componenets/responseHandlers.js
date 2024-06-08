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

export const handleDobResponse = async (response, setDobSubmitted, setError1) => {
  if (response.ok) {
    setDobSubmitted(true);
    setError1('');
  } else if (response.status === 404) {
    setError1('Invalid DOB');
  } else if (response.status === 429) {
    setError1('Too many attempts, please try again after 15 minutes.');
  } else {
    const responseData = await response.json();
    setError1(responseData.message || 'Error logging DOB.');
  }
};

export const handleFeeTypeResponse = async (response, setOption, setError) => {
  if (response.ok) {
    const responseData = await response.json();
    setOption(responseData.options); // Assuming the response contains an array of options
    setError('');
  } else if (response.status === 429) {
    setError('Too many attempts, please try again after 15 minutes.');
  } else {
    const responseData = await response.json();
    setError(responseData.message || 'Error fetching fee type options.');
  }
};
