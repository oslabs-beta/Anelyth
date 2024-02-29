import React from "react";
import ReactDOM from "react-dom"; // Change this import
import App from './Components/App.jsx';
import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client';
import D3 from "./Components/D3.jsx";
import './styles.css';
// const root = ReactDOM.createRoot(document.getElementById("root"));

const root = createRoot(document.querySelector('#root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
     <App/>
    </BrowserRouter>
  </React.StrictMode>
);
