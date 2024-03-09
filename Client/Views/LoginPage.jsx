import React, { useState } from 'react'

function LoginPage() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === 'userName') setUserName(value);
    else if (name === 'password') setPassword(value);
  }

  async function handleSubmit() {
    try {
      let response = await fetch('/api/login', {
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
      <div className='enter-pw'>
        <label>Password:
          <input type="text" name='password' value={password} onChange={handleChange}/>
        </label>
      </div>
      <input type="button" value='Submit' onClick={handleSubmit}/>
      <br />
      <a href="/signup">Signup</a>
    </>
  )
}

export default LoginPage