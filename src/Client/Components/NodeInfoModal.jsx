import React from "react";
import '../Styles/nodeinfomodal.css';

const NodeInfoModal = ({ data }) => {
  const { name, value: fileSize, dependencies } = data;
  return (
    <div className="info-modal-container">
      <div className="info-modal">
        <div className="node-file-title-container">
          <p className="node-file-title">File Name:</p>
          <p className="node-file-name">{name}</p>
        </div>
        <div className="node-info-container">
          <div className="node-info-row">
            <p className="node-info-param">File size: </p>
            <p className="node-info-value"> {fileSize} {' (bytes)'}</p>
          </div>
          <p className="node-info-param">Cyclomatic Complexity:</p>
          <p className="node-info-param">Lines of Code:</p>
          <p className="node-depend-title">Dependencies: </p>
          <div className="depend-list">
            {dependencies.map(({ dependencyTypes, module, resolved, source }) => <p className="depend-item" >- {source}</p>)}  
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeInfoModal;