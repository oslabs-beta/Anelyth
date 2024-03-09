import React, { useState } from 'react'

function SignupPage() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === 'userName') setUserName(value);
    else if (name === 'password') setPassword(value);
  }

  async function handleSubmit() {
    try {
      let response = await fetch('/api/signup', {
        method: 'POST',
        body: JSON.stringify({
          userName: userName,
          password: password
        }),
        headers: {'Content-Type': 'application/json'}
      });
      response = await response.json();
      console.log('response:', response)
      //TODO: handle response
    } catch (error) {
      console.log(`The following error occured during login attempt: ${error}`);
    }
  }

  return (
    <>
      <div className='enter-name'>
        <label>Username:
          <input type="text" name='userName' value={userName} onChange={handleChange}/>
        </label>
      </div>
      <div className='enter-firstName'>
        <label>Username:
          <input type="text" name='firstname' value={userName} onChange={handleChange}/>
        </label>
      </div>
      <div className='enter-lastName'>
        <label>Username:
          <input type="text" name='lastName' value={userName} onChange={handleChange}/>
        </label>
      </div>
      <div className='enter-email'>
        <label>Username:
          <input type="text" name='email' value={userName} onChange={handleChange}/>
        </label>
      </div>
      <div className='enter-pw'>
        <label>Password:
          <input type="text" name='password' value={password} onChange={handleChange}/>
        </label>
      </div>
      <input type="button" value='Submit' onClick={handleSubmit}/>
    </>
  )
}

export default SignupPage