import React from "react";
import '../Styles/nodeinfomodal.css';

const NodeInfoModal = ({ data }) => {
  const { name, value: fileSize, dependencies } = data;
  return (
    <div className="info-modal">
      <p>File name: {name}</p>
      <p>File size {'(bytes)'}: {fileSize}</p>
      <p>Dependencies: </p>
      {dependencies.map(({ dependencyTypes, module, resolved, source }) => <p style={{ textIndent: '30px' }}>- {source}</p>)}  
    </div>
  );
};

export default NodeInfoModal;