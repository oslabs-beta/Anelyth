import React from "react";
import App from './Components/App.jsx';
import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client';
import './styles.css';

const root = createRoot(document.querySelector('#root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
     <App/>
    </BrowserRouter>
  </React.StrictMode>
);