import React, { useState } from 'react';
import '../Styles/usermainpage.css';
import icon1 from '../Assets/icons/icons8-project-100.png';
import icon2 from '../Assets/icons/icons8-molecule-100.png';
import icon3 from '../Assets/icons/icons8-dificulty-64.png';
import icon4 from '../Assets/icons/icons8-pyramid-96.png';
import icon5 from '../Assets/icons/icons8-logout-96.png';
import icon6 from '../Assets/icons/icons8-circles-100.png'

import RepoUpload from '../Components/RepoUpload.tsx';
import ClustersDisplay from '../Components/ClustersDisplay';
import NodeInfoModal from '../Components/NodeInfoModal.jsx';

function UserMainPage() {
  const [popupShowing, setPopupShowing] = useState(false);
  const [clickedNodeData, setClickedNodeData] = useState(null);
  const [clusterData, setClusterData] = useState(null);
  const [hoveredMicroservice, setHoveredMicroservice] = useState(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);


  const handleHoverMicroservice = (microservice) => {
    setHoveredMicroservice(microservice);
  };


  return (
  <>
  <div className='usermainpage'>
    <div className='side-panel'>
      <div className='app-title'><a className='app-title-link' href="/">Anelyth.</a></div>
      <hr />
      <div className='side-items-top-bot-container'>
        <div className='side-items-container'>
          <div className='item-container'>
              <img className='icon-inv' src={icon2} alt="" />
              <a className='items' href="/usermain">Workbench</a>
          </div>
          <div className='item-container'>
            <img className='icon-inv' src={icon1} alt="" />
            <a className='items' href="/repos">Projects</a>
          </div>
        </div>
        <div className='side-items-bot-container'>
          <div className='item-container'>
            <img className='icon-inv' src={icon6} alt="" />
            <a className='items' href="/repos">Download Visual</a>
          </div>
          <div className='item-container'>
            <img className='icon-inv' src={icon4} alt="" />
            <a className='items' href="/repos">Download AST</a>
          </div>
          <div className='item-container'>
            <img className='icon-inv' src={icon1} alt="" />
            <a className='items' href="/repos">Help</a>
          </div>
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
      <RepoUpload
              popupShowing={popupShowing}
              setPopupShowing={setPopupShowing}
              setClickedNodeData={setClickedNodeData}
              clusterData={clusterData}
              setClusterData={setClusterData}
              hoveredMicroservice={hoveredMicroservice}
              setIsZoomedIn={setIsZoomedIn}
              isZoomedIn={isZoomedIn}

            />
        <div className='clusters-infopanel'>
          <div className='info-panel'>
            <div className='side-section-title-container'>
              <h2>File Overview</h2>
            </div>
            {popupShowing && clickedNodeData.dependencies && <NodeInfoModal data={clickedNodeData}/>}
          </div>
            <div className='side-section-title-container'>
              <h2>Microservices Overview</h2>
            </div>
          <div className='clusters-display-container'>
            {clusterData && <ClustersDisplay clusterData={clusterData} handleHoverMicroservice={handleHoverMicroservice}/>} 
          </div>
        </div>
      </div>
    </div>

  </div>
  </>
  )
}

export default UserMainPage