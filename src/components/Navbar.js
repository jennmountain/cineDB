import React, { useState } from 'react'

const navStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .navbar {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    background: #F8F6F2;
    border-bottom: 1px solid #E4DDD4;
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    font-family: 'DM Sans', sans-serif;
  }

  .navbar-logo {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0;
  }

  .navbar-logo-mark {
    font-family: 'DM Serif Display', serif;
    font-size: 18px;
    color: #1C1C1A;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .navbar-logo-mark span {
    color: #B5622A;
  }

  .navbar-links {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .navbar-link {
    background: none;
    border: none;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    padding: 5px 12px;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.02em;
    transition: all 0.15s;
    color: #6B6660;
  }

  .navbar-link:hover {
    color: #1C1C1A;
    background: #EDE9E3;
  }

  .navbar-link.active {
    color: #1C1C1A;
    background: #EDE9E3;
    font-weight: 600;
  }

  .navbar-right {
    position: relative;
    display: flex;
    align-items: center;
  }

  .navbar-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #1C1C1A;
    color: #F8F6F2;
    border: none;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
    letter-spacing: 0.02em;
  }

  .navbar-avatar:hover {
    background: #B5622A;
  }

  .navbar-dropdown {
    position: absolute;
    top: 38px;
    right: 0;
    background: #F8F6F2;
    border: 1px solid #E4DDD4;
    border-radius: 12px;
    padding: 6px;
    min-width: 170px;
    box-shadow: 0 8px 24px rgba(28, 28, 26, 0.1);
    z-index: 101;
  }

  .navbar-dropdown-user {
    padding: 7px 10px 9px;
    border-bottom: 1px solid #EDE9E3;
    margin-bottom: 4px;
  }

  .navbar-dropdown-username {
    font-size: 13px;
    font-weight: 600;
    color: #1C1C1A;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .navbar-admin-badge {
    font-size: 9px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 100px;
    background: #EDE9E3;
    color: #B5622A;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .navbar-signout {
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 7px 10px;
    font-size: 12px;
    color: #9A9390;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    transition: all 0.15s;
    letter-spacing: 0.01em;
  }

  .navbar-signout:hover {
    background: #EDE9E3;
    color: #c0392b;
  }
`

export default function Navbar({ profile, currentPage, navigate, onSignOut }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navItem = (label, target) => (
    <button
      key={target}
      onClick={() => navigate(target)}
      className={`navbar-link${currentPage === target ? ' active' : ''}`}
    >
      {label}
    </button>
  )

  return (
    <>
      <style>{navStyles}</style>
      <div className="navbar">

        {/* Logo */}
        <button className="navbar-logo" onClick={() => navigate('browse')}>
          <span className="navbar-logo-mark">
            Cine<span>DB</span>
          </span>
        </button>

        {/* Nav links */}
        <div className="navbar-links">
          {navItem('Browse', 'browse')}
          {navItem('My List', 'watchlist')}
          {navItem('Picks', 'recommendations')}
          {navItem('SQL Explorer', 'sql')}
          {profile?.is_admin && navItem('Admin', 'admin')}
        </div>

        {/* User menu */}
        <div className="navbar-right">
          <button
            className="navbar-avatar"
            onClick={() => setMenuOpen(o => !o)}
          >
            {(profile?.username || '?')[0].toUpperCase()}
          </button>

          {menuOpen && (
            <>
              <div
                onClick={() => setMenuOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 99 }}
              />
              <div className="navbar-dropdown">
                <div className="navbar-dropdown-user">
                  <div className="navbar-dropdown-username">
                    {profile?.username}
                    {profile?.is_admin && (
                      <span className="navbar-admin-badge">admin</span>
                    )}
                  </div>
                </div>
                <button
                  className="navbar-signout"
                  onClick={() => { setMenuOpen(false); onSignOut() }}
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </>
  )
}
