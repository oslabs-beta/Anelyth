import React from "react";
import '../Styles/nodeinfomodal.css';

const NodeInfoModal = ({ data }) => {
  const { name, value: fileSize, dependencies } = data;
  console.log('dependencies:', dependencies)
  return (
    <div className="info-modal">
      {name}
      {fileSize}
      {dependencies.map(({ dependencyTypes, module, resolved, source }) => <div>{source}</div>)}    
    </div>
  );
};

export default NodeInfoModal;