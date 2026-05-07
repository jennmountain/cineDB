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

  .rp-meta {
    font-size: 11px;
    color: #9A9390;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 500;
    margin-bottom: 20px;
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
`

const TYPE_FILTERS = [
  { value: 'all',   label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv',    label: 'TV Series' },
]

export default function RecommendationsPage({ navigate, session, profile }) {
  const [recs,       setRecs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')

  const isAdmin = profile?.is_admin

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('recommendations')
      .select('id, created_at, media(*), profiles(username)')
      .order('created_at', { ascending: false })
    setRecs(data || [])
    setLoading(false)
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

          {/* Grid */}
          <div className="rp-grid">
            {loading && (
              <div className="rp-empty">
                <div style={{ fontSize: 13 }}>Loading…</div>
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="rp-empty">
                <div className="rp-empty-icon">↑</div>
                <div className="rp-empty-title">No recommendations yet</div>
                <div className="rp-empty-sub">
                  Open any movie or show and click "↑ Recommend" to add it here
                </div>
              </div>
            )}

            {!loading && filtered.map(rec => (
              <div key={rec.id} className="rp-card-wrap">
                <MediaCard
                  media={rec.media}
                  onClick={() => navigate('detail', rec.media.id)}
                />
                <span className="rp-recommender">
                  ↑ {rec.profiles?.username || 'Someone'}
                </span>
                {isAdmin && (
                  <button
                    className="rp-remove-btn"
                    onClick={e => { e.stopPropagation(); removeRec(rec.id) }}
                    title="Remove recommendation"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}
