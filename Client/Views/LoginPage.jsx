import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import bgIMG from '../Assets/loginimg.png';
import '../Styles/login.css';

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
    <div className='login-container'>

      <div className='form-container'>
        <div className='enter-username'>
          <label>Username:</label>
          <input type="text" name='username' value={formData.username} onChange={handleChange}/>
        </div>
        <div className='enter-password'>
          <label>Password:</label>
          <input type="text" name='password' value={formData.password} onChange={handleChange}/>
        </div>
        <input className='login-button' type="button" value='Submit' onClick={handleSubmit}/>
        <a href="/signup">Signup</a>
      </div>
      <img className='bg-img' src={bgIMG} alt="" />
    </div>
    </>
  )
}

export default LoginPage