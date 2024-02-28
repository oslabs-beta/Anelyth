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


    // -------  for heiartchty -------- //
    for (let i = 0; i < file.length; i++) {
      const filePath = file[i].webkitRelativePath;
      formData.append(`${filePath}`, file[i], file[i].originalname);
    }



    try {
      const response = await fetch('/api/fileupload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // console.log('Response data received from server: ', data);
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