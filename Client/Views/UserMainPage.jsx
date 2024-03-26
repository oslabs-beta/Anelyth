import React, { useState } from 'react';
import '../Styles/usermainpage.css';
import icon1 from '../Assets/icons/icons8-project-100.png';
import icon2 from '../Assets/icons/icons8-molecule-100.png';
import icon3 from '../Assets/icons/icons8-dificulty-64.png';
import icon4 from '../Assets/icons/icons8-pyramid-96.png';
import icon5 from '../Assets/icons/icons8-logout-96.png';

import RepoUpload from '../Components/RepoUpload.jsx';
import NodeInfoModal from '../Components/NodeInfoModal.jsx';

function UserMainPage() {
  const [popupShowing, setPopupShowing] = useState(false);
  const [clickedNodeData, setClickedNodeData] = useState(null);

  return (
  <>
  <div className='usermainpage'>
    <div className='side-panel'>
      <div className='app-title'><a className='app-title-link' href="/">Anelyth.</a></div>
      <hr />
      <div className='side-items-container'>
        <div className='item-container'>
          <img className='icon-inv' src={icon1} alt="" />
          <a className='items' href="/repos">Projects</a>
        </div>
        <div className='item-container'>
          <img className='icon-inv' src={icon4} alt="" />
          <a className='items' href="/">Heiarchy</a>
        </div>
        <div className='item-container'>
          <img className='icon-inv' src={icon2} alt="" />
          <a  className='items' href="/">Dependencies</a>
        </div>
        <div className='item-container'>
          <img className='icon-inv' src={icon3} alt="" />
          <a className='items' href="/">Complexity</a>
        </div>
      </div>
      <div className='side-bottom-container'>
        <div className='item-container'>
          <img className='icon-inv' src={icon5} alt="signout icon" />
          <a className='items' href="/api/signout">Sign Out</a>
        </div>
      </div>
    </div>

    <div className='main-content'>
      <div className='visual-container'>
        <RepoUpload popupShowing={popupShowing} setPopupShowing={setPopupShowing} setClickedNodeData={setClickedNodeData} />
        <div className='info-panel'>
          {popupShowing && clickedNodeData.dependencies && <NodeInfoModal data={clickedNodeData}/>}
        </div>
      </div>
    </div>

  </div>
  </>
  )
}

export default UserMainPage