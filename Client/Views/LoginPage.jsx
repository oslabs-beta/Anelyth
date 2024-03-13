import React, { useState } from 'react'
import { useNavigate } from 'react-router';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({...prevFormData, [name]: value}));
  }

  async function handleSubmit() {
    try {
      let response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {'Content-Type': 'application/json'}
      });
      
      if (response.status === 404) {
        alert('Username or password incorrect!');
      } else if (response.status === 200) {
        alert('Login successful!')
        navigate('/usermain');
      }
      response = await response.json();
      console.log('response:', response)
      //TODO: handle response
    } catch (error) {
      console.log(`The following error occured during login attempt: ${error}`);
    }
  }


  return (
    <>
      <div className='enter-username'>
        <label>Username:
          <input type="text" name='username' value={formData.username} onChange={handleChange}/>
        </label>
      </div>
      <div className='enter-password'>
        <label>Password:
          <input type="password" name='password' value={formData.password} onChange={handleChange}/>
        </label>
      </div>
      <input className='login-button' type="button" value='Submit' onClick={handleSubmit}/>
      <br />
      <a href="/signup">Signup</a>
    </>
  )
}

export default LoginPage