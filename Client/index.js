// const subBTN = document.querySelector('#submit-btn');
// const file = document.querySelector('#file');

// subBTN.addEventListener('click', async () => {
//   console.log('in event listener')
//   await fetch('http://localhost:8080/fileupload', {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json', 
//     },
//   })
// })

import React from "react";
import ReactDOM from "react-dom/client";
import App from './Components/App';
import { BrowserRouter } from "react-router-dom";


const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);