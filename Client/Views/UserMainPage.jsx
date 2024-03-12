import React from 'react';
import '../Styles/usermainpage.css';

import RepoUpload from '../Components/RepoUpload.jsx';

function UserMainPage() {
  return (
  <>
  <div className='usermainpage'>
    <div className='side-panel'>
      <div className='side-items-container'>
        <div className='items'><a href="/repos">Projects</a></div>
        <div className='items'><a href="/">Heiarchy</a></div>
        <div className='items'><a href="/">Dependencies</a></div>
        <div className='items'><a href="/">Goals</a></div>
      </div>
    </div>
    <div className='main-content'>
      <RepoUpload />
    </div>

  </div>
  </>
  )
}

export default UserMainPage