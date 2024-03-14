import React from 'react';
import '../Styles/header.css';

function Header() {
  return (
      <header className="header">
        <nav className='navbar'>
          <div ><a className='header-title' href="/">MonoSplit</a></div>
          <div className='nav-links'>
            <a className='header-links' href="/usermain">Main</a>
            <a className='header-links' href="/docs">Documentation</a>
            {/* <a className='' href="/signup">Signup</ßa> */}
            <a className='header-links' href="/login">Login</a>
          </div>
        </nav>
      </header>
  )
}

export default Header