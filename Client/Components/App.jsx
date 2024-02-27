import React, { useState } from 'react'

export default function App() {
  const [files, setFiles] = useState(null);

  function handleFiles(e) {
    setFiles(e.target.files);
  }

  async function uploadFiles() {
    if (!files) {
      return alert('Please choose files to upload');
    }

    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      // Append file 
      // The first parameter is the name of the form field (used by the server to retrieve the uploaded file(s))
      // The second parameter is the file object
      // The third parameter is optional and represents the filename; if omitted, the File object's name is used
      const filePath = files[i].webkitRelativePath;
      formData.append(`${filePath}`, files[i], files[i].originalname);
      // Append filePath: server will receive an array of strings (filePaths)
      // const filePath = files[i].webkitRelativePath;
      // formData.append('filePaths', filePath);
    }

    try {
      const response = await fetch('/api/fileupload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Response data received from server: ', data);
      } else {
        console.error('Upload failed');
      }
    } catch (err) {
      console.error('Error uploading files: ', err);
    }
  }

  return (
    <div>
      <div className="form-example">
        <label htmlFor="name">Choose file: </label>
        <input type="file" name="file" id="file" onChange={handleFiles} webkitdirectory='true' />
      </div>
      <button onClick={uploadFiles} id="submit-btn">Submit</button>
    </div>
  )
}