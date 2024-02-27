import React, { useState } from 'react'

export default function App() {
  const [file, setFile] = useState(null);

  function handleFile(e) {
    setFile(e.target.files);
  }

  async function apiCall() {
    console.log('hit apiCall');

    if (!file) {
      return alert('Please choose a file');
    }

    const formData = new FormData();
    // formData.append('file', file);
    
    for (let i = 0; i < file.length; i++) {
      // The first parameter is the name of the form field (used by the server to retrieve the uploaded file(s))
      // The second parameter is the file object
      // The third parameter is optional and represents the filename; if omitted, the File object's name is used
      // Loop through the FileList and append each file to the FormData object
      formData.append('file', file[i], file[i].originalname);
    }
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
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
      console.error('Error uploading file: ', err);
    }
  }


  return (
    <div>
      <div className="form-example">
        <label htmlFor="name">Choose file: </label>
        <input type="file" name="file" id="file" onChange={handleFile} webkitdirectory='true' />
      </div>
      <button onClick={apiCall} id="submit-btn">Submit</button>
    </div>
  )
}