import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import '../Styles/signup.css';
import bgIMG from '../Assets/loginimg.png';

function SignupPage() {
  const navigate = useNavigate();
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

      if (response.status === 200) {
        alert('Signup Successful!');
        navigate('/login');
      } else {
        alert('Error occured during signup');
      }

    } catch (error) {
      console.log(`The following error occured during login attempt: ${error}`);
    }
  }

  return (
    <>
    <div>
      <div className='enter-username'>
        <label className='input-title'>Username:</label>
        <input type="text" name='username' value={formData.username} onChange={handleChange}/>
        
      </div>
      <div className='enter-firstName'>
        <label>First name:</label>
        <input type="text" name='firstName' value={formData.firstName} onChange={handleChange}/>
        
      </div>
      <div className='enter-lastName'>
        <label>Last name:</label>
        <input type="text" name='lastName' value={formData.lastName} onChange={handleChange}/>
        
      </div>
      <div className='enter-email'>
        <label>Email:</label>
        <input type="text" name='email' value={formData.email} onChange={handleChange}/>
        
      </div>
      <div className='enter-password'>
        <label>Password:</label>
        <input type="password" name='password' value={formData.password} onChange={handleChange} />
        
      </div>
      <input type="button" value='Submit' onClick={handleSubmit}/>
    </div>
    <img className='bg-img' src={bgIMG} alt="" />

    </>
  )
}

export default SignupPage