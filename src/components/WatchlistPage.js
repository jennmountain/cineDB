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

  .wl-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .wl-page-title {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    color: #1C1C1A;
    font-weight: 400;
  }

  .wl-share-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
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

  .wl-share-btn:hover {
    border-color: #B5622A;
    color: #B5622A;
  }

  .wl-share-btn.copied {
    border-color: #3B6D11;
    color: #3B6D11;
    background: #EAF3DE;
  }

  /* Stats bar */
  .wl-stats {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    margin-bottom: 28px;
  }

  @media (max-width: 900px) { .wl-stats { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 600px) { .wl-stats { grid-template-columns: repeat(2, 1fr); } }

  .wl-stat-card {
    background: #fff;
    border: 1px solid #EDE9E3;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
  }

  .wl-stat-value {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    color: #1C1C1A;
    font-weight: 400;
    line-height: 1.1;
    margin-bottom: 4px;
  }

  .wl-stat-value.accent {
    color: #B5622A;
  }

  .wl-stat-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9A9390;
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

  .wl-empty-icon { font-size: 36px; margin-bottom: 14px; }

  .wl-empty-title {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    color: #4A4440;
    margin-bottom: 6px;
  }

  .wl-empty-sub { font-size: 13px; margin-bottom: 20px; }


  .wl-genre-bar {
    background: #fff;
    border: 1px solid #EDE9E3;
    border-radius: 12px;
    padding: 18px 20px;
    margin-bottom: 28px;
  }

  .wl-genre-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9A9390;
    margin-bottom: 14px;
  }

  .wl-genre-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .wl-genre-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .wl-genre-name {
    font-size: 12px;
    font-weight: 500;
    color: #1C1C1A;
    width: 90px;
    flex-shrink: 0;
  }

  .wl-genre-track {
    flex: 1;
    height: 6px;
    background: #EDE9E3;
    border-radius: 100px;
    overflow: hidden;
  }

  .wl-genre-fill {
    height: 100%;
    border-radius: 100px;
    background: #B5622A;
    transition: width 0.4s ease;
  }

  .wl-genre-count {
    font-size: 11px;
    color: #9A9390;
    font-weight: 500;
    width: 20px;
    text-align: right;
    flex-shrink: 0;
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

  /* Share modal */
  .wl-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(28,28,26,0.4);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .wl-modal {
    background: #F8F6F2;
    border-radius: 16px;
    padding: 28px;
    max-width: 460px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(28,28,26,0.2);
  }

  .wl-modal-title {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    color: #1C1C1A;
    margin-bottom: 6px;
    font-weight: 400;
  }

  .wl-modal-sub {
    font-size: 13px;
    color: #9A9390;
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .wl-modal-list {
    background: #fff;
    border: 1px solid #E4DDD4;
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 16px;
    max-height: 200px;
    overflow-y: auto;
    font-size: 13px;
    color: #1C1C1A;
    line-height: 1.8;
    font-family: 'DM Sans', sans-serif;
  }

  .wl-modal-copy-btn {
    width: 100%;
    background: #1C1C1A;
    color: #F8F6F2;
    border: none;
    border-radius: 10px;
    padding: 12px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    margin-bottom: 8px;
    transition: background 0.15s;
  }

  .wl-modal-copy-btn:hover {
    background: #B5622A;
  }

  .wl-modal-close {
    width: 100%;
    background: transparent;
    color: #9A9390;
    border: 1.5px solid #E4DDD4;
    border-radius: 10px;
    padding: 11px;
    font-size: 13px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }
`

const TABS = [
  { value: 'all',           label: 'All' },
  { value: 'favourite',     label: '♥ Favourites' },
  { value: 'want_to_watch', label: 'Want to Watch' },
  { value: 'watched',       label: 'Watched' },
]

export default function WatchlistPage({ navigate, session, profile }) {
  const [items,       setItems]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState('all')
  const [copied,      setCopied]      = useState(false)
  const [showShare,   setShowShare]   = useState(false)

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

  // Stats calculations
  const totalTitles   = items.length
  const watched       = items.filter(i => i.watch_status === 'watched').length
  const favourites    = items.filter(i => i.is_favourite).length
  const totalMinutes  = items
    .filter(i => i.watch_status === 'watched' && i.media?.runtime_minutes)
    .reduce((sum, i) => sum + i.media.runtime_minutes, 0)
  const totalHours    = Math.round(totalMinutes / 60)

  const genreMap = {}
  for (const item of items) {
    const g = item.media?.genre
    if (g) genreMap[g] = (genreMap[g] || 0) + 1
  }
  const topGenre = Object.entries(genreMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  // Share list text
  const shareText = [
    `🎬 ${profile?.username || 'My'}'s CineDB Watchlist`,
    '',
    `📋 Total: ${totalTitles} titles`,
    `✓ Watched: ${watched}`,
    `♥ Favourites: ${favourites}`,
    '',
    '— Watched —',
    ...items
      .filter(i => i.watch_status === 'watched')
      .map(i => `• ${i.media?.title} (${i.media?.release_year || '—'})`),
    '',
    '— Want to Watch —',
    ...items
      .filter(i => i.watch_status === 'want_to_watch')
      .map(i => `• ${i.media?.title} (${i.media?.release_year || '—'})`),
  ].join('\n')

  function handleCopy() {
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filtered = items.filter(matchesTab)

  return (
    <>
      <style>{styles}</style>
      <div className="wl-root">
        <div className="wl-inner">

          {/* Header */}
          <div className="wl-page-label">My List</div>
          <div className="wl-header-row">
            <div className="wl-page-title">What I'm Watching</div>
            <button
              className={`wl-share-btn${copied ? ' copied' : ''}`}
              onClick={() => setShowShare(true)}
            >
              {copied ? '✓ Copied!' : '↗ Share my list'}
            </button>
          </div>

          {/* Stats bar */}
          {!loading && totalTitles > 0 && (
            <div className="wl-stats">
              <div className="wl-stat-card">
                <div className="wl-stat-value">{totalTitles}</div>
                <div className="wl-stat-label">Total Titles</div>
              </div>
              <div className="wl-stat-card">
                <div className="wl-stat-value accent">{watched}</div>
                <div className="wl-stat-label">Watched</div>
              </div>
              <div className="wl-stat-card">
                <div className="wl-stat-value">{favourites}</div>
                <div className="wl-stat-label">Favourites</div>
              </div>
              <div className="wl-stat-card">
                <div className="wl-stat-value accent">{totalHours > 0 ? `${totalHours}h` : '—'}</div>
                <div className="wl-stat-label">Hours Watched</div>
              </div>
              <div className="wl-stat-card">
                <div className="wl-stat-value" style={{ fontSize: topGenre.length > 7 ? 18 : 26 }}>{topGenre}</div>
                <div className="wl-stat-label">Top Genre</div>
              </div>
            </div>
          )}


          {/* Genre breakdown */}
          {!loading && totalTitles > 0 && Object.keys(genreMap).length > 0 && (
            <div className="wl-genre-bar">
              <div className="wl-genre-label">Genre Breakdown</div>
              <div className="wl-genre-row">
                {Object.entries(genreMap)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([genre, count]) => (
                    <div key={genre} className="wl-genre-item">
                      <span className="wl-genre-name">{genre}</span>
                      <div className="wl-genre-track">
                        <div
                          className="wl-genre-fill"
                          style={{ width: `${Math.round((count / totalTitles) * 100)}%` }}
                        />
                      </div>
                      <span className="wl-genre-count">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

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

      {/* Share modal */}
      {showShare && (
        <div className="wl-modal-overlay" onClick={() => setShowShare(false)}>
          <div className="wl-modal" onClick={e => e.stopPropagation()}>
            <div className="wl-modal-title">Share your list</div>
            <div className="wl-modal-sub">
              Copy a text summary of your watchlist to share with friends.
            </div>
            <div className="wl-modal-list">
              {shareText}
            </div>
            <button className="wl-modal-copy-btn" onClick={handleCopy}>
              {copied ? '✓ Copied to clipboard!' : 'Copy to clipboard'}
            </button>
            <button className="wl-modal-close" onClick={() => setShowShare(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
