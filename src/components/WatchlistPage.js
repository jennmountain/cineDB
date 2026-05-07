import React, { useState, useEffect } from 'react'
import supabase from '../config/supabaseClient'
import MediaCard from './MediaCard'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .wl-root {
    font-family: 'DM Sans', sans-serif;
    background: #F8F6F2;
    min-height: 100vh;
  }

  .wl-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 32px 28px;
  }

  .wl-page-label {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #B5622A;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .wl-page-title {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    color: #1C1C1A;
    margin-bottom: 28px;
    font-weight: 400;
  }

  .wl-tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 24px;
    border-bottom: 1px solid #E4DDD4;
    padding-bottom: 16px;
  }

  .wl-tab {
    padding: 6px 16px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border: 1.5px solid #D4C9BA;
    background: transparent;
    color: #6B6660;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }

  .wl-tab:hover {
    border-color: #B5622A;
    color: #B5622A;
  }

  .wl-tab.active {
    background: #1C1C1A;
    border-color: #1C1C1A;
    color: #F8F6F2;
  }

  .wl-count {
    opacity: 0.6;
    margin-left: 4px;
  }

  .wl-meta {
    font-size: 11px;
    color: #9A9390;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 500;
    margin-bottom: 20px;
  }

  .wl-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
    margin-bottom: 48px;
    align-items: start;
  }

  @media (max-width: 1100px) { .wl-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (max-width: 700px)  { .wl-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

  .wl-card-wrap {
    position: relative;
    width: 100%;
  }

  .wl-status-badge {
    position: absolute;
    bottom: 52px;
    right: 8px;
    background: rgba(28,28,26,0.7);
    color: #F8F6F2;
    font-size: 9px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 100px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-family: 'DM Sans', sans-serif;
  }

  .wl-empty {
    text-align: center;
    padding: 80px 0;
    color: #9A9390;
  }

  .wl-empty-icon {
    font-size: 36px;
    margin-bottom: 14px;
  }

  .wl-empty-title {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    color: #4A4440;
    margin-bottom: 6px;
  }

  .wl-empty-sub {
    font-size: 13px;
    margin-bottom: 20px;
  }

  .wl-browse-btn {
    background: #1C1C1A;
    color: #F8F6F2;
    border: none;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    padding: 9px 20px;
  }
`

const TABS = [
  { value: 'all',           label: 'All' },
  { value: 'favourite',     label: '♥ Favourites' },
  { value: 'want_to_watch', label: 'Want to Watch' },
  { value: 'watched',       label: 'Watched' },
]

export default function WatchlistPage({ navigate, session, profile }) {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('all')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('watchlist')
      .select('watch_status, is_favourite, media(*)')
      .eq('user_id', session.user.id)
      .order('added_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  function matchesTab(item) {
    if (tab === 'all')       return true
    if (tab === 'favourite') return item.is_favourite
    return item.watch_status === tab
  }

  function countTab(value) {
    if (value === 'favourite') return items.filter(i => i.is_favourite).length
    if (value === 'all')       return items.length
    return items.filter(i => i.watch_status === value).length
  }

  function statusLabel(item) {
    const parts = []
    if (item.watch_status === 'want_to_watch') parts.push('Want to Watch')
    else if (item.watch_status === 'watched')  parts.push('Watched')
    if (item.is_favourite) parts.push('♥')
    return parts.join(' · ')
  }

  const filtered = items.filter(matchesTab)

  return (
    <>
      <style>{styles}</style>
      <div className="wl-root">
        <div className="wl-inner">

          {/* Header */}
          <div className="wl-page-label">My List</div>
          <div className="wl-page-title">What I'm Watching</div>

          {/* Tabs */}
          <div className="wl-tabs">
            {TABS.map(t => (
              <button
                key={t.value}
                className={`wl-tab${tab === t.value ? ' active' : ''}`}
                onClick={() => setTab(t.value)}
              >
                {t.label}
                <span className="wl-count">({countTab(t.value)})</span>
              </button>
            ))}
          </div>

          {/* Count */}
          <div className="wl-meta">
            {loading ? 'Loading…' : `${filtered.length} title${filtered.length !== 1 ? 's' : ''}`}
          </div>

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="wl-empty">
              <div className="wl-empty-icon">📋</div>
              <div className="wl-empty-title">Nothing here yet</div>
              <div className="wl-empty-sub">Browse movies and add them to your list</div>
              <button className="wl-browse-btn" onClick={() => navigate('browse')}>
                Browse movies
              </button>
            </div>
          )}

          {/* Grid */}
          {!loading && filtered.length > 0 && (
            <div className="wl-grid" style={{ alignItems: 'start' }}>
              {filtered.map(item => (
                <div key={item.media.id} className="wl-card-wrap">
                  <MediaCard
                    media={item.media}
                    onClick={() => navigate('detail', item.media.id)}
                  />
                  {statusLabel(item) && (
                    <span className="wl-status-badge">{statusLabel(item)}</span>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  )
}