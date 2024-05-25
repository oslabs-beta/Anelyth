import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import '../Styles/signup.css';
// @ts-ignore
import bgIMG from '../Assets/block3.png';
import Header from '../Components/Header';

interface FormData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;

}

function SignupPage(): JSX.Element {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({username: '', firstName: '', lastName: '', email: '', password: ''});

  function handleChange(e: any) {
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
        // alert('Signup Successful!');
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
    <Header />
    <div className='signup-container'>
      <div className='form-container-signup'>
        <div className='login-title'>Sign Up</div>
        <div className='enter-info'>
          <label className='input-title'>Username:</label>
          <input className='form-input' type="text" name='username' value={formData.username} onChange={handleChange}/>
          
        </div>
        <div className='enter-info'>
          <label className='input-title'>First name:</label>
          <input className='form-input' type="text" name='firstName' value={formData.firstName} onChange={handleChange}/>
          
        </div>
        <div className='enter-info'>
          <label className='input-title'>Last name:</label>
          <input className='form-input' type="text" name='lastName' value={formData.lastName} onChange={handleChange}/>
          
        </div>
        <div className='enter-info'>
          <label className='input-title'>Email:</label>
          <input className='form-input' type="text" name='email' value={formData.email} onChange={handleChange}/>
          
        </div>
        <div className='enter-info'>
          <label className='input-title'>Password:</label>
          <input className='form-input' type="password" name='password' value={formData.password} onChange={handleChange} />
          
        </div>
        <input className='login-button' type="button" value='Submit' onClick={handleSubmit}/>

        <div className='no-acc-container'>
            <div className='no-acc-text'>Already Have An Account?</div>
            <a className='no-acc-link' href="/login">Log In</a>
          </div>
      </div>
    <img className='bg-img' src={bgIMG} alt="" />
    </div>

    </>
  )
}

export default SignupPage