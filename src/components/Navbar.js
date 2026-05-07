import React, { useState } from 'react'

const navStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .navbar {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    background: #F8F6F2;
    border-bottom: 1px solid #E4DDD4;
    height: 62px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
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
    font-size: 22px;
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
    gap: 4px;
  }

  .navbar-link {
    background: none;
    border: none;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.01em;
    transition: all 0.15s;
    color: #6B6660;
    white-space: nowrap;
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

  .navbar-link.active-accent {
    color: #B5622A;
    background: #FDF0E8;
    font-weight: 600;
  }

  .navbar-right {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .navbar-username-chip {
    font-size: 12px;
    font-weight: 500;
    color: #9A9390;
    font-family: 'DM Sans', sans-serif;
  }

  .navbar-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #1C1C1A;
    color: #F8F6F2;
    border: none;
    font-size: 13px;
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
    top: 44px;
    right: 0;
    background: #F8F6F2;
    border: 1px solid #E4DDD4;
    border-radius: 14px;
    padding: 8px;
    min-width: 200px;
    box-shadow: 0 8px 32px rgba(28, 28, 26, 0.12);
    z-index: 101;
  }

  .navbar-dropdown-user {
    padding: 10px 12px 12px;
    border-bottom: 1px solid #EDE9E3;
    margin-bottom: 6px;
  }

  .navbar-dropdown-username {
    font-size: 14px;
    font-weight: 600;
    color: #1C1C1A;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
  }

  .navbar-dropdown-email {
    font-size: 11px;
    color: #9A9390;
    font-family: 'DM Sans', sans-serif;
  }

  .navbar-admin-badge {
    font-size: 9px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 100px;
    background: #FDF0E8;
    color: #B5622A;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: 1px solid #F0D4B8;
  }

  .navbar-dropdown-item {
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 9px 12px;
    font-size: 13px;
    color: #1C1C1A;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .navbar-dropdown-item:hover {
    background: #EDE9E3;
  }

  .navbar-dropdown-item.danger {
    color: #9A9390;
  }

  .navbar-dropdown-item.danger:hover {
    background: #FFF0F0;
    color: #c0392b;
  }

  .navbar-dropdown-divider {
    height: 1px;
    background: #EDE9E3;
    margin: 4px 0;
  }
`

export default function Navbar({ profile, currentPage, navigate, onSignOut }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navItem = (label, target, emoji = null) => (
    <button
      key={target}
      onClick={() => navigate(target)}
      className={`navbar-link${currentPage === target ? ' active' : ''}`}
    >
      {emoji && <span style={{ marginRight: 4 }}>{emoji}</span>}
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
          {navItem('Browse', 'browse', '🎬')}
          {navItem('My List', 'watchlist', '📋')}
          {navItem('Picks', 'recommendations', '⭐')}
          {navItem('SQL Explorer', 'sql', '🔍')}
          {profile?.is_admin && navItem('Admin', 'admin', '⚙️')}
        </div>

        {/* User menu */}
        <div className="navbar-right">
          <span className="navbar-username-chip">{profile?.username}</span>
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

                <button className="navbar-dropdown-item"
                  onClick={() => { setMenuOpen(false); navigate('watchlist') }}>
                  📋 My List
                </button>
                <button className="navbar-dropdown-item"
                  onClick={() => { setMenuOpen(false); navigate('recommendations') }}>
                  ⭐ Picks
                </button>
                {profile?.is_admin && (
                  <button className="navbar-dropdown-item"
                    onClick={() => { setMenuOpen(false); navigate('admin') }}>
                    ⚙️ Admin
                  </button>
                )}

                <div className="navbar-dropdown-divider" />

                <button
                  className="navbar-dropdown-item danger"
                  onClick={() => { setMenuOpen(false); onSignOut() }}
                >
                  ↩ Sign out
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </>
  )
}
