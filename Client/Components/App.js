import React from 'react'

export default function App() {

  function apiCall (){
    console.log('hit call')
    fetch('/api/fileupload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }



  return (<>
    <div>App</div>
    <div className="form-example">
    <label htmlFor="name">Choose file: </label>
    <input type="file" name="file" id="file" />
  </div>
  <button onClick={()=> apiCall()} id="submit-btn">Submit</button>
  </>
  )
}
