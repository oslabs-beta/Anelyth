import React, { useState } from 'react';
// @ts-ignore
import D3 from './D3.jsx';
import '../Styles/repoupload.css';
import ClustersDisplay from './ClustersDisplay';

interface RepoUploadProps {
  popupShowing: boolean;
  setPopupShowing: (value: boolean) => void;
  setClickedNodeData: (value: any) => void;
  setAnalyzeButton: (value: boolean) => void;
  clusterData: any; 
  setClusterData: (value: any) => void; 
}

function RepoUpload({ popupShowing, setPopupShowing, setClickedNodeData, setAnalyzeButton, clusterData, setClusterData} : RepoUploadProps) {
  const [hierarchyData, setHierarchyData] = useState(null);

  async function apiCall(event : any) {

    event.preventDefault();
    const files = event.target.elements.file.files;
    console.log(files);
    console.log('hit apiCall');

    if (!files || !files.length) {
      return alert('Please choose a file');
    }

    const formData = new FormData();

    // -------  File Filtering -------- //
    for (let i = 0; i < files.length; i++) {
      const filePath = files[i].webkitRelativePath;
      if (!filePath.includes('node_modules') && !filePath.includes('.git') && !filePath.includes('.DS_Store')) {
        formData.append(filePath, files[i], files[i].name);
        console.log('array: ', filePath.split('/'));
      }
    }
    // ------- Need to refactor fetch to also save the data to AWS S3 -------- //
    try {
      const response = await fetch('/api/fileupload', {
        method: 'POST',
        body: formData,
      });


      if (response.ok) {
        console.log('upload complete');
        const data = await response.json();
        console.log('Data that was sent from the backend to feed into the D3 component - data array',data.clusters);
        // send the data to s3 bucket here // 
        // add here // 

        // for now to test //
        setHierarchyData(data.hierarchy.children[0]);
        setClusterData(data.clusters);
        setAnalyzeButton(true); //setter function to render analyze button

      } else {
        console.error('Upload failed');
      }
    } catch (err) {
      console.error('Error uploading file: ', err);
    }
  }



  return (
    <>
    <div className='repo-upload-main'>

      {/* <div className="form-example">
        <form onSubmit={apiCall}>
          <input type="file" name="file" id="file" multiple webkitdirectory="true" />
          <button type="submit" id="submit-btn">Submit</button>
        </form>
      </div> */}

      <div className='d3-visual-container'>
        {hierarchyData === null ? (
          <div className='upload-repo-container'>
            <h1 className='upload-alert'>Upload A Repository</h1>
            <div className="form-example">
              <form onSubmit={apiCall}>
                {/* @ts-expect-error */}
                <input type="file" name="file" id="file" multiple webkitdirectory="true" />
                <button type="submit" id="submit-btn">Submit</button>
              </form>
            </div>
          </div>
          
        ) : (
          <div className='D3-container'>
            <D3 hierarchyData={hierarchyData} popupShowing={popupShowing} setPopupShowing={setPopupShowing} setClickedNodeData={setClickedNodeData} />
          </div>
        )}
      </div>

    </div>
    
    </>

  )
}

export default RepoUpload