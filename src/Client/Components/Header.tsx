import React from 'react';
import '../Styles/header.css';
// @ts-ignore
import logo from '../Assets/blockLOGO_trans.png';



function Header(): JSX.Element {
  return (
    <header className="header">
      <nav className='navbar'>
        <div className='title-logo-container'>
          <a className='header-title' href="/">Anelyth.</a>
          <img className='header-logo-img' src={logo} alt="" />
        </div>
        <div className='nav-links'>
          <a className='header-links' href="/usermain">Main</a>
          <a className='header-links' href="/docs">Documentation</a>
          {/* <a className='' href="/signup">Signup</a> */}
          <a className='header-links' href="/login">Login</a>
        </div>
      </nav>
    </header>
  );
}

export default Header;
