import React, { useState } from 'react';
import '../Styles/usermainpage.css';

import RepoUpload from '../Components/RepoUpload.jsx';
import NodeInfoModal from '../Components/NodeInfoModal.jsx';

function UserMainPage() {
  const [popupShowing, setPopupShowing] = useState(false);
  const [clickedNodeData, setClickedNodeData] = useState(null);

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
      <RepoUpload popupShowing={popupShowing} setPopupShowing={setPopupShowing} setClickedNodeData={setClickedNodeData} />
    </div>
    <div className='info-panel'>
      {popupShowing && clickedNodeData.dependencies && <NodeInfoModal data={clickedNodeData}/>}
    </div>
  </div>
  </>
  )
}

export default UserMainPage