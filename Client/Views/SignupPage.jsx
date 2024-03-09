import React, { useState } from 'react'

function SignupPage() {
  const [formData, setFormData] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({...prevFormData, [name]: value}));
  }

  async function handleSubmit() {
    try {
      let response = await fetch('/api/signup', {
        method: 'POST',
        body: JSON.stringify(formData),
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
      <div className='enter-userName'>
        <label>Username:
          <input type="text" name='userName' value={formData.userName} onChange={handleChange}/>
        </label>
      </div>
      <div className='enter-firstName'>
        <label>First name:
          <input type="text" name='firstName' value={formData.firstName} onChange={handleChange}/>
        </label>
      </div>
      <div className='enter-lastName'>
        <label>Last name:
          <input type="text" name='lastName' value={formData.lastName} onChange={handleChange}/>
        </label>
      </div>
      <div className='enter-email'>
        <label>Email:
          <input type="text" name='email' value={formData.email} onChange={handleChange}/>
        </label>
      </div>
      <div className='enter-password'>
        <label>Password:
          <input type="password" name='password' value={formData.password} onChange={handleChange} />
        </label>
      </div>
      <input type="button" value='Submit' onClick={handleSubmit}/>
    </>
  )
}

export default SignupPage