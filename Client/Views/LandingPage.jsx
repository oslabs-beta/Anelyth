import React from 'react'
import '../Styles/landingpage.css';
import screenshot from '../Assets/Screenshot 2024-03-07 at 9.21.34 PM.png';

import Header from '../Components/Header.jsx';

function LandingPage() {
  return ( 
  <>
    <Header />
    <div className='landingMasterDiv'>
      <div className='main-top-container'>
        <div className='greeting-text'>Microservice Migration Simplified</div>
        <div className='greeting-blerb'>Make calculated code architecture decisions by applying data driven calulations to determine microservice bounderies</div>
        <div className='btn-container'>
          <button className='btn btn-focus'>Download</button>
          <button className='btn btn-secondary'>Sign Up</button>
        </div>
      </div>
      <div className='main-second-container'>
        <div className='main-s-inner'>
          <img className='app-img1' src={screenshot} alt="" /> 
          <div className='ms-r-container'>
            <div className='ms-r-text'>text about what the user can do in our app, all the visual tools and the heiarchy of the code base</div>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}

export default LandingPage