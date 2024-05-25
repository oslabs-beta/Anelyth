import React, { useEffect } from 'react';
import '../Styles/landingpage.css';

import screenshot from '../Assets/Screenshot 2024-03-07 at 9.21.34 PM.png';
import Header from '../Components/Header.tsx';
import Blocks from '../Components/Blocks.tsx';
import Shatter from '../Components/Shatter.jsx';
import scott from '../Assets/teamPics/scottimg.jpg';
import cm from '../Assets/teamPics/cm.png';
import mg from '../Assets/teamPics/mg.jpg';
import rt from '../Assets/teamPics/rt.jpeg';
import gs from '../Assets/teamPics/gs.jpeg';
import github from '../Assets/github-logo.png';
import linkedin from '../Assets/linkedin-logo.png';


function LandingPage() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  return ( 
  <>
    <Header />

    <div className='landingMasterDiv'>
      <div className='main-top-container'>
        <div className='greeting-text'>Microservice Migration Simplified</div>
        <div className='greeting-blerb'>An automated, data-driven approach to identifying potential microservices.</div>
        <div className='btn-container'>
          <button className='btn btn-focus'>Download</button>
          <button className='btn btn-secondary'><a className='btn-link' href="/signup">Sign Up</a></button>
        </div>
        <div className='shatter'>
          <Shatter />
        </div>
      </div>




      <div className='main-second-container'>
        <div className='main-s-inner'>
          <img className='app-img1' src={screenshot} alt="" /> 
          <div className='ms-r-container'>
            <div className='ms-text-headline'>Everything you need in one place.</div>
            <div className='ms-r-text'>Obtain a comprehensive understanding of the codebase.
Identifying potential microservices at different levels. From larger modules that might represent a service to finer-grained functionalities within modules that could be decoupled.</div>
          </div>
        </div>
      </div>
      <div className='hz-rule'></div>
      
      <div className='main-third-container'>

        <div className='mt-l-container'>
          <div className='ml-l-headline'>The solution that your team has been looking for.</div>
          <div className='mt-l-text'>
          By employing automated extraction techniques to identify potential microservices boundaries within the monolithic codebase, we can analyze code coupling, cohesion, and domain boundaries to determine optimal decomposition strategies and extract cohesive modules as microservices.
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
            <img className='person-img' src={rt} alt="" />
            <div className='person-name'>Ross Terker</div>
            <div className='social-container'>
              <div className='socials'>
                <a href="https://github.com/rterker" target='_blank'><img className='social-logo' src={github} alt="" /></a>
                <a className='social-text' href="https://github.com/rterker" target='_blank'>GitHub</a>
              </div>
              <div className='socials'>
                <a href="https://www.linkedin.com/in/ross-terker-6168a0b" target='_blank'><img className='social-logo' src={linkedin} alt="" /></a>
                <a className='social-text' href="https://www.linkedin.com/in/ross-terker-6168a0b" target='_blank'>LinkedIn</a>
              </div>
            </div>
          </div>
          <div className='person-card'>
            <img className='person-img' src={mg} alt="" />
            <div className='person-name'>Moises Gomez</div>
            <div className='social-container'>
              <div className='socials'>
                <a href="https://github.com/moisesgomez1" target='_blank'><img className='social-logo' src={github} alt="" /></a>
                <a className='social-text' href="https://github.com/moisesgomez1" target='_blank'>GitHub</a>
              </div>
              <div className='socials'>
                <a href="https://www.linkedin.com/in/moisesgomezr/" target='_blank'><img className='social-logo' src={linkedin} alt="" /></a>
                <a className='social-text' href="https://www.linkedin.com/in/moisesgomezr/" target='_blank'>LinkedIn</a>
              </div>
            </div>
          </div>
          <div className='person-card'>
            <img className='person-img' src={scott} alt="" />
            <div className='person-name'>Scott Zembsch</div>
            <div className='social-container'>
              <div className='socials'>
                <a href="https://github.com/ScottZembsch" target='_blank'><img className='social-logo' src={github} alt="" /></a>
                <a className='social-text' href="https://github.com/ScottZembsch" target='_blank'>GitHub</a>
              </div>
              <div className='socials'>
                <a href=""><img className='social-logo' src={linkedin} alt="" /></a>
                <a className='social-text' href="">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className='person-card'>
            <img className='person-img' src={gs} alt="" />
            <div className='person-name'>Greg Silvia</div>
            <div className='social-container'>
              <div className='socials'>
                <a href="https://github.com/GregSilvia" target='_blank'><img className='social-logo' src={github} alt="" /></a>
                <a className='social-text' href="https://github.com/GregSilvia" target='_blank'>GitHub</a>
              </div>
              <div className='socials'>
                <a href="" target='_blank'><img className='social-logo' src={linkedin} alt="" /></a>
                <a className='social-text' href="" target='_blank'>LinkedIn</a>
              </div>
            </div>
          </div>
          <div className='person-card'>
            <img className='person-img' src={cm} alt="" />
            <div className='person-name'>Christian Magorrian</div>
            <div className='social-container'>
              <div className='socials'>
                <a href="https://github.com/cmagorr1" target='_blank'><img className='social-logo' src={github} alt="" /></a>
                <a className='social-text' href="https://github.com/cmagorr1" target='_blank'>GitHub</a>
              </div>
              <div className='socials'>
                <a href="https://www.linkedin.com/in/christian-magorrian-651362116/" target='_blank'><img className='social-logo' src={linkedin} alt="" /></a>
                <a className='social-text' href="https://www.linkedin.com/in/christian-magorrian-651362116/" target='_blank'>LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='hz-rule'></div>
      <footer className='main-foot'>
        
      </footer>
    </div>
  </>
  )
}

export default LandingPage