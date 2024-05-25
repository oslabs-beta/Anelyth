import React, { useState } from 'react'
import { useNavigate } from 'react-router';
// @ts-ignore
import bgIMG from '../Assets/block3.png';
import '../Styles/login.css';
import Header from '../Components/Header';

interface FormData {
  userOrEmail: string;
  password: string;
}

function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({userOrEmail: '', password: ''});
  // console.log('formData:', formData)

  function handleChange(e: any) {
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
        navigate('/usermain');
      }
    } catch (error) {
      console.log(`The following error occured during login attempt: ${error}`);
    }
  }


  return (
    <>
    <Header />
    <div className='login-container'>
      <div className='form-container'>
        <div className='login-title'>Log In</div>
        <div className='inner-container'>
          <div className='enter-info'>
            <label className='input-title'>Username or Email:</label>
            <input className='form-input' type="text" name='userOrEmail' value={formData.userOrEmail} onChange={handleChange}/>
          </div>
          <div className='enter-info'>
            <label className='input-title'>Password:</label>
            <input className='form-input' type="password" name='password' value={formData.password} onChange={handleChange}/>
          </div>
          <input className='login-button' type="button" value='Submit' onClick={handleSubmit}/>

          <div className='no-acc-container'>
            <div className='no-acc-text'>No Account?</div>
            <a className='no-acc-link' href="/signup">Sign Up</a>
          </div>
        </div>
        </div>
      <img className='bg-img' src={bgIMG} alt="" />
    </div>
    </>
  )
}

export default LoginPage