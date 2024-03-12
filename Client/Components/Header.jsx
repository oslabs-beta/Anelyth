import React from 'react';
import '../Styles/header.css';

function Header() {
  return (
      <header className="header">
        <nav className='navbar'>
          <div className='title'>MonoSplit</div>
          <div className='nav-links'>
            <a className='' href="/usermain">Main</a>
            <a className='' href="/docs">Documentation</a>
            {/* <a className='' href="/signup">Signup</ßa> */}
            <a className='' href="/login">Login</a>
          </div>
        </nav>
      </header>
  )
}

export default Header