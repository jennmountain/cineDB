import React, { useState, useEffect } from 'react'
import supabase from '../config/supabaseClient'
import MediaCard from './MediaCard'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .rp-root {
    font-family: 'DM Sans', sans-serif;
    background: #F8F6F2;
    min-height: 100vh;
  }

  .rp-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 32px 28px;
  }

  .rp-page-label {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #B5622A;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .rp-page-title {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    color: #1C1C1A;
    margin-bottom: 6px;
    font-weight: 400;
  }

  .rp-page-sub {
    font-size: 13px;
    color: #9A9390;
    margin-bottom: 28px;
  }

  .rp-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 24px;
    border-bottom: 1px solid #E4DDD4;
    padding-bottom: 16px;
    align-items: center;
  }

  .rp-filter-pill {
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

  .rp-filter-pill:hover {
    border-color: #B5622A;
    color: #B5622A;
  }

  .rp-filter-pill.active {
    background: #1C1C1A;
    border-color: #1C1C1A;
    color: #F8F6F2;
  }

  .rp-filter-divider {
    width: 1px;
    height: 18px;
    background: #D4C9BA;
    margin: 0 2px;
  }

  .rp-admin-note {
    margin-left: auto;
    font-size: 11px;
    color: #9A9390;
    font-style: italic;
  }

  .rp-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
    align-items: start;
  }

  @media (max-width: 1100px) { .rp-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (max-width: 700px)  { .rp-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

  .rp-card-wrap {
    position: relative;
    width: 100%;
  }

  .rp-recommender {
    position: absolute;
    bottom: 52px;
    left: 8px;
    background: rgba(181,98,42,0.9);
    color: #fff;
    font-size: 9px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 100px;
    letter-spacing: 0.04em;
    font-family: 'DM Sans', sans-serif;
    max-width: calc(100% - 16px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rp-remove-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(28,28,26,0.65);
    color: #F8F6F2;
    border: none;
    cursor: pointer;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.15s;
  }

  .rp-remove-btn:hover {
    background: #c0392b;
  }

  .rp-empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 80px 0;
    color: #9A9390;
  }

  .rp-empty-icon {
    font-size: 36px;
    margin-bottom: 14px;
  }

  .rp-empty-title {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    color: #4A4440;
    margin-bottom: 6px;
  }

  .rp-empty-sub {
    font-size: 13px;
  }

  /* Leaderboard */
  .lb-section {
    border-top: 1px solid #E4DDD4;
    padding-top: 36px;
    margin-top: 48px;
  }

  .lb-section-label {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #B5622A;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .lb-section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 24px;
    color: #1C1C1A;
    margin-bottom: 6px;
    font-weight: 400;
  }

  .lb-section-sub {
    font-size: 13px;
    color: #9A9390;
    margin-bottom: 28px;
  }

  .lb-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }

  @media (max-width: 900px) { .lb-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 600px) { .lb-grid { grid-template-columns: 1fr; } }

  .lb-card {
    background: #fff;
    border: 1px solid #EDE9E3;
    border-radius: 12px;
    padding: 20px;
  }

  .lb-card-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9A9390;
    margin-bottom: 16px;
  }

  .lb-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 0;
    border-bottom: 1px solid #F0EBE4;
  }

  .lb-row:last-child {
    border-bottom: none;
  }

  .lb-rank {
    font-size: 12px;
    font-weight: 700;
    color: #C4BAB0;
    min-width: 20px;
    text-align: center;
  }

  .lb-rank.top {
    color: #B5622A;
  }

  .lb-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #1C1C1A;
    color: #F8F6F2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .lb-name {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    color: #1C1C1A;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .lb-value {
    font-size: 12px;
    font-weight: 600;
    color: #1C1C1A;
    flex-shrink: 0;
  }

  .lb-value-sub {
    font-size: 10px;
    color: #9A9390;
    font-weight: 400;
  }

  .lb-media-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid #F0EBE4;
    cursor: pointer;
  }

  .lb-media-row:last-child {
    border-bottom: none;
  }

  .lb-media-poster {
    width: 32px;
    height: 44px;
    border-radius: 4px;
    background: #EDE9E3;
    overflow: hidden;
    flex-shrink: 0;
  }

  .lb-media-poster img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .lb-media-info {
    flex: 1;
    min-width: 0;
  }

  .lb-media-title {
    font-size: 13px;
    font-weight: 500;
    color: #1C1C1A;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 2px;
  }

  .lb-media-meta {
    font-size: 11px;
    color: #9A9390;
  }
`

const TYPE_FILTERS = [
  { value: 'all',   label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv',    label: 'TV Series' },
]

function getPosterUrl(posterUrl) {
  if (!posterUrl) return null
  if (posterUrl.startsWith('http')) return posterUrl
  const { data } = supabase.storage.from('posters').getPublicUrl(posterUrl)
  return data.publicUrl
}

export default function RecommendationsPage({ navigate, session, profile }) {
  const [recs,          setRecs]          = useState([])
  const [loading,       setLoading]       = useState(true)
  const [typeFilter,    setTypeFilter]    = useState('all')
  const [topReviewers,  setTopReviewers]  = useState([])
  const [topRated,      setTopRated]      = useState([])
  const [mostWatched,   setMostWatched]   = useState([])
  const [lbLoading,     setLbLoading]     = useState(true)

  const isAdmin = profile?.is_admin

  useEffect(() => { load(); loadLeaderboard() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('recommendations')
      .select('id, created_at, media(*), profiles(username)')
      .order('created_at', { ascending: false })
    setRecs(data || [])
    setLoading(false)
  }

  async function loadLeaderboard() {
    setLbLoading(true)
    const [{ data: reviewers }, { data: rated }, { data: watched }] = await Promise.all([
      // Top reviewers by review count
      supabase.from('reviews')
        .select('user_id, rating, profiles(username)')
        .order('created_at', { ascending: false }),
      // Top rated media
      supabase.from('media')
        .select('id, title, type, avg_rating, genre, release_year, poster_url')
        .gt('avg_rating', 0)
        .order('avg_rating', { ascending: false })
        .limit(5),
      // Most added to watchlist
      supabase.from('watchlist')
        .select('media_id, media(id, title, type, release_year, genre, poster_url)'),
    ])

    // Aggregate reviewers
    if (reviewers) {
      const map = {}
      for (const r of reviewers) {
        if (!r.user_id) continue
        if (!map[r.user_id]) map[r.user_id] = { username: r.profiles?.username || 'Unknown', count: 0, total: 0 }
        map[r.user_id].count++
        map[r.user_id].total += r.rating
      }
      const sorted = Object.values(map)
        .map(u => ({ ...u, avg: u.count > 0 ? (u.total / u.count).toFixed(1) : 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      setTopReviewers(sorted)
    }

    if (rated) setTopRated(rated)

    // Aggregate most watchlisted
    if (watched) {
      const map = {}
      for (const w of watched) {
        if (!w.media_id || !w.media) continue
        if (!map[w.media_id]) map[w.media_id] = { media: w.media, count: 0 }
        map[w.media_id].count++
      }
      const sorted = Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5)
      setMostWatched(sorted)
    }

    setLbLoading(false)
  }

  async function removeRec(recId) {
    if (!window.confirm('Remove this recommendation?')) return
    await supabase.from('recommendations').delete().eq('id', recId)
    setRecs(prev => prev.filter(r => r.id !== recId))
  }

  const filtered = recs.filter(r => {
    if (typeFilter === 'all') return true
    return r.media?.type === typeFilter
  })

  return (
    <>
      <style>{styles}</style>
      <div className="rp-root">
        <div className="rp-inner">

          {/* Header */}
          <div className="rp-page-label">Community</div>
          <div className="rp-page-title">Recommendations</div>
          <div className="rp-page-sub">
            Movies and shows recommended by our community — add yours from any title page.
          </div>

          {/* Filters */}
          <div className="rp-filters">
            {TYPE_FILTERS.map(f => (
              <button
                key={f.value}
                className={`rp-filter-pill${typeFilter === f.value ? ' active' : ''}`}
                onClick={() => setTypeFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
            <div className="rp-filter-divider" />
            <span style={{ fontSize: 12, color: '#9A9390' }}>
              {loading ? '' : `${filtered.length} recommendation${filtered.length !== 1 ? 's' : ''}`}
            </span>
            {isAdmin && filtered.length > 0 && (
              <span className="rp-admin-note">Admin: click ✕ to remove any recommendation</span>
            )}
          </div>

          {/* Picks grid */}
          <div className="rp-grid">
            {loading && <div className="rp-empty"><div style={{ fontSize: 13 }}>Loading…</div></div>}

            {!loading && filtered.length === 0 && (
              <div className="rp-empty">
                <div className="rp-empty-icon">↑</div>
                <div className="rp-empty-title">No recommendations yet</div>
                <div className="rp-empty-sub">Open any movie or show and click "↑ Recommend" to add it here</div>
              </div>
            )}

            {!loading && filtered.map(rec => (
              <div key={rec.id} className="rp-card-wrap">
                <MediaCard media={rec.media} onClick={() => navigate('detail', rec.media.id)} />
                <span className="rp-recommender">↑ {rec.profiles?.username || 'Someone'}</span>
                {isAdmin && (
                  <button className="rp-remove-btn"
                    onClick={e => { e.stopPropagation(); removeRec(rec.id) }}
                    title="Remove recommendation">✕</button>
                )}
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          <div className="lb-section">
            <div className="lb-section-label">Stats</div>
            <div className="lb-section-title">Community Leaderboard</div>
            <div className="lb-section-sub">Top reviewers, highest rated titles, and most watchlisted.</div>

            {lbLoading ? (
              <p style={{ fontSize: 13, color: '#9A9390' }}>Loading…</p>
            ) : (
              <div className="lb-grid">

                {/* Top reviewers */}
                <div className="lb-card">
                  <div className="lb-card-title">Top Reviewers</div>
                  {topReviewers.length === 0 && <p style={{ fontSize: 12, color: '#C4BAB0' }}>No reviews yet.</p>}
                  {topReviewers.map((u, i) => (
                    <div key={u.username} className="lb-row">
                      <span className={`lb-rank${i < 3 ? ' top' : ''}`}>{i + 1}</span>
                      <div className="lb-avatar">{u.username[0].toUpperCase()}</div>
                      <span className="lb-name">{u.username}</span>
                      <span className="lb-value">
                        {u.count} <span className="lb-value-sub">reviews</span>
                      </span>
                      <span className="lb-value" style={{ color: '#B5622A' }}>
                        ★ {u.avg}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Highest rated */}
                <div className="lb-card">
                  <div className="lb-card-title">Highest Rated</div>
                  {topRated.length === 0 && <p style={{ fontSize: 12, color: '#C4BAB0' }}>No ratings yet.</p>}
                  {topRated.map((m, i) => (
                    <div key={m.id} className="lb-media-row" onClick={() => navigate('detail', m.id)}>
                      <span className={`lb-rank${i < 3 ? ' top' : ''}`}>{i + 1}</span>
                      <div className="lb-media-poster">
                        {getPosterUrl(m.poster_url)
                          ? <img src={getPosterUrl(m.poster_url)} alt={m.title} />
                          : null}
                      </div>
                      <div className="lb-media-info">
                        <div className="lb-media-title">{m.title}</div>
                        <div className="lb-media-meta">{m.release_year} · {m.genre}</div>
                      </div>
                      <span className="lb-value" style={{ color: '#B5622A' }}>★ {m.avg_rating}</span>
                    </div>
                  ))}
                </div>

                {/* Most watchlisted */}
                <div className="lb-card">
                  <div className="lb-card-title">Most Watchlisted</div>
                  {mostWatched.length === 0 && <p style={{ fontSize: 12, color: '#C4BAB0' }}>No watchlist data yet.</p>}
                  {mostWatched.map((w, i) => (
                    <div key={w.media.id} className="lb-media-row" onClick={() => navigate('detail', w.media.id)}>
                      <span className={`lb-rank${i < 3 ? ' top' : ''}`}>{i + 1}</span>
                      <div className="lb-media-poster">
                        {getPosterUrl(w.media.poster_url)
                          ? <img src={getPosterUrl(w.media.poster_url)} alt={w.media.title} />
                          : null}
                      </div>
                      <div className="lb-media-info">
                        <div className="lb-media-title">{w.media.title}</div>
                        <div className="lb-media-meta">{w.media.release_year} · {w.media.genre}</div>
                      </div>
                      <span className="lb-value">
                        {w.count} <span className="lb-value-sub">lists</span>
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
