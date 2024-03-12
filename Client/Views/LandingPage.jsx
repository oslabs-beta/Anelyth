import React from 'react'
import '../Styles/landingpage.css';

import screenshot from '../Assets/Screenshot 2024-03-07 at 9.21.34 PM.png';
import Header from '../Components/Header.jsx';
import Blocks from '../Components/blocks.jsx';
import Shatter from '../Components/Shatter.jsx';
import scott from '../Assets/teamPics/scottimg.jpg';


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
        <div className='shatter'>
          <Shatter />
        </div>
      </div>




      <div className='main-second-container'>
        <div className='main-s-inner'>
          <img className='app-img1' src={screenshot} alt="" /> 
          <div className='ms-r-container'>
            <div className='ms-r-text'>With Fisson, you can visualize your code structure in an highly informative and digestable manner with total control over what data you need. View file heiarchy, dependencies, or even code complextiy with the click of a button. </div>
          </div>
        </div>
      </div>
      <div className='hz-rule'></div>
      
      <div className='main-third-container'>

        <div className='mt-l-container'>
          <div className='mt-l-text'>
          With MonoSplits data driven approach, you are able to see potential microservices in your codebase.
          </div>

        </div>
        <div className='tc-inner-container'>
        <Blocks />
        </div>
      </div>

      <div className='hz-rule'></div>


      <div className='fourth-container-main'>
        <div className='meet-header'>Meet The Team</div>
        <div className='team-container'>
          <div className='person-card'>
            <img className='person-img' src="" alt="" />
            <div className='person-name'>Ross Terker</div>
          </div>
          <div className='person-card'>
            <img className='person-img' src="" alt="" />
            <div className='person-name'>Moises Gomez</div>
          </div>
          <div className='person-card'>
            <img className='person-img' src={scott} alt="" />
            <div className='person-name'>Scott Zembsch</div>
          </div>
          <div className='person-card'>
            <img className='person-img' src="" alt="" />
            <div className='person-name'>Greg Silvia</div>
          </div>
          <div className='person-card'>
            <img className='person-img' src="" alt="" />
            <div className='person-name'>Christian Magorrian</div>
          </div>
        </div>
      </div>
      <div className='hz-rule'></div>
      <footer className='main-foot'>
        <div>Contact</div>
      </footer>
    </div>
  </>
  )
}

export default LandingPage