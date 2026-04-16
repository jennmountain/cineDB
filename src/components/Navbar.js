import React, { useState } from 'react'

export default function Navbar({ profile, currentPage, navigate, onSignOut }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navItem = (label, target) => (
    <button
      onClick={() => navigate(target)}
      style={{
        background: 'none',
        border: 'none',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        padding: '4px 10px',
        borderRadius: 6,
        color: currentPage === target ? '#111' : '#666',
        background: currentPage === target ? '#f0f0ee' : 'none',
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: '#fff', borderBottom: '0.5px solid #eee',
      height: 54, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 24px',
    }}>
      {/* Logo */}
      <button
        onClick={() => navigate('browse')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <span style={{
          background: '#F5C518', color: '#111', fontWeight: 700,
          fontSize: 13, padding: '2px 6px', borderRadius: 4, letterSpacing: 0.5,
        }}>CineDB</span>
      </button>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {navItem('Browse', 'browse')}
        {navItem('My List', 'watchlist')}
        {navItem('SQL Explorer', 'sql')}
        {profile?.is_admin && navItem('Admin', 'admin')}
      </div>

      {/* User menu */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            background: '#111', color: '#fff', border: 'none',
            borderRadius: '50%', width: 32, height: 32, fontSize: 12,
            fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {(profile?.username || '?')[0].toUpperCase()}
        </button>

        {menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
            <div style={{
              position: 'absolute', top: 38, right: 0, background: '#fff',
              border: '0.5px solid #eee', borderRadius: 10, padding: 8,
              minWidth: 160, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 100,
            }}>
              <div style={{ padding: '6px 10px', fontSize: 12, color: '#888', borderBottom: '0.5px solid #f0f0f0', marginBottom: 4 }}>
                {profile?.username}
                {profile?.is_admin && (
                  <span style={{ marginLeft: 6, background: '#EEEDFE', color: '#3C3489', fontSize: 10, padding: '1px 6px', borderRadius: 10, fontWeight: 500 }}>admin</span>
                )}
              </div>
              <button
                onClick={() => { setMenuOpen(false); onSignOut() }}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '7px 10px', fontSize: 13, color: '#c0392b', borderRadius: 6, cursor: 'pointer' }}
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
