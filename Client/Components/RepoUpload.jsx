import React, { useState } from 'react';
import D3 from './D3.jsx';



function RepoUpload() {
  const [hierarchyData, setHierarchyData] = useState(null);

  async function apiCall(event) {

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
        console.log('response from after upload: ',data);
        // send the data to s3 bucket here // 
        // add here // 

        // for now to test //
        setHierarchyData(data);

      } else {
        console.error('Upload failed');
      }
    } catch (err) {
      console.error('Error uploading file: ', err);
    }
  }



  return (
    <div>
    <div className="form-example">
      <form onSubmit={apiCall}>
        <label htmlFor="file">Choose file: </label>
        <input type="file" name="file" id="file" multiple webkitdirectory="true" />
        <button type="submit" id="submit-btn">Submit</button>
      </form>
      <D3 hierarchyData={hierarchyData} />
    </div>
  </div>
  )
}

export default RepoUpload