import React, { useEffect, useRef, useState } from 'react';
import Legend from './Legend.jsx';
import PackChart from './PackChart.jsx';

const D3 = ({ hierarchyData, popupShowing, setPopupShowing, setClickedNodeData }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (hierarchyData) {
      setData(hierarchyData);
    }
  }, [hierarchyData]);

  function handleNodeClick(nodeData) {
    setClickedNodeData(nodeData);
    setPopupShowing(!popupShowing);
  }

  const options = {
    width: 928,
    height: 600,
    fill: "#ddd",
    stroke: "#bbb",
    onNodeClick: handleNodeClick
  };

  return (
    <div className='d3'>
      <h1>Pack Chart</h1>
      <Legend /> {/* Include the Legend component */}
      {data && <PackChart data={data} options={options} />}
    </div>
  );
};

export default D3;

