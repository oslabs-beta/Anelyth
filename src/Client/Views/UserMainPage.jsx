import React, { useState } from 'react';
import '../Styles/usermainpage.css';
import icon1 from '../Assets/icons/icons8-project-100.png';
import icon2 from '../Assets/icons/icons8-molecule-100.png';
import icon3 from '../Assets/icons/icons8-dificulty-64.png';
import icon4 from '../Assets/icons/icons8-pyramid-96.png';
import icon5 from '../Assets/icons/icons8-logout-96.png';

import RepoUpload from '../Components/RepoUpload.tsx';
import ClustersDisplay from '../Components/ClustersDisplay';
import NodeInfoModal from '../Components/NodeInfoModal.jsx';

function UserMainPage() {
  const [popupShowing, setPopupShowing] = useState(false);
  const [clickedNodeData, setClickedNodeData] = useState(null);
  const [clusterData, setClusterData] = useState(null);
  const [hoveredMicroservice, setHoveredMicroservice] = useState(null);

  const handleHoverMicroservice = (microservice) => {
    setHoveredMicroservice(microservice);
  };


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
      
      {/* {analyzeButtonShowing && (
      <div className='btn-container-main-page'>
        <button className='btn btn-secondary btn-pulse'><a className='btn-link'>Analyze</a></button>


        </div>)} */}


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
            />
        <div className='clusters-infopanel'>
          <div className='info-panel'>
            {popupShowing && clickedNodeData.dependencies && <NodeInfoModal data={clickedNodeData}/>}
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