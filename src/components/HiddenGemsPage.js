import React, { useState, useEffect } from 'react'
import supabase from '../config/supabaseClient'
import MediaCard from './MediaCard'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .hg-root {
    font-family: 'DM Sans', sans-serif;
    background: #F8F6F2;
    min-height: 100vh;
  }

  .hg-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 32px 28px;
  }

  .hg-label {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #B5622A;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .hg-title {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    color: #1C1C1A;
    font-weight: 400;
    margin-bottom: 6px;
  }

  .hg-sub {
    font-size: 13px;
    color: #9A9390;
    margin-bottom: 28px;
    line-height: 1.6;
    max-width: 520px;
  }

  .hg-criteria {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 28px;
  }

  .hg-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: #fff;
    border: 1px solid #EDE9E3;
    border-radius: 100px;
    font-size: 12px;
    color: #6B6660;
    font-weight: 500;
  }

  .hg-chip-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #B5622A;
    flex-shrink: 0;
  }

  .hg-meta {
    font-size: 11px;
    color: #9A9390;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 500;
    margin-bottom: 20px;
  }

  .hg-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
    margin-bottom: 48px;
    align-items: start;
  }

  @media (max-width: 1100px) { .hg-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (max-width: 700px)  { .hg-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

  .hg-card-wrap {
    position: relative;
    width: 100%;
  }

  .hg-gem-badge {
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
  }

  .hg-empty {
    text-align: center;
    padding: 80px 0;
    color: #9A9390;
  }

  .hg-empty-icon { font-size: 40px; margin-bottom: 14px; }

  .hg-empty-title {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    color: #4A4440;
    margin-bottom: 6px;
  }

  .hg-empty-sub { font-size: 13px; }

  .hg-loading-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .hg-skeleton {
    border-radius: 10px;
    overflow: hidden;
    background: #EDE9E3;
    animation: hgPulse 1.5s ease-in-out infinite;
  }

  .hg-skeleton-poster { height: 280px; background: #E0DBD4; }
  .hg-skeleton-body { padding: 12px; }
  .hg-skeleton-line { height: 12px; border-radius: 4px; background: #D4CFC8; margin-bottom: 8px; }
  .hg-skeleton-line.short { width: 60%; }

  @keyframes hgPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
`

export default function HiddenGemsPage({ navigate }) {
  const [gems,    setGems]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)

    // Get all media with avg_rating >= 8
    const { data: highRated } = await supabase
      .from('media')
      .select('*')
      .gte('avg_rating', 8)
      .order('avg_rating', { ascending: false })

    if (!highRated || highRated.length === 0) { setGems([]); setLoading(false); return }

    // Get review counts for each
    const { data: reviewCounts } = await supabase
      .from('reviews')
      .select('media_id')

    const countMap = {}
    for (const r of reviewCounts || []) {
      countMap[r.media_id] = (countMap[r.media_id] || 0) + 1
    }

    // Hidden gems = high rated but fewer than 3 reviews
    const gems = highRated
      .filter(m => (countMap[m.id] || 0) < 3)
      .slice(0, 24)

    setGems(gems)
    setLoading(false)
  }

  return (
    <>
      <style>{styles}</style>
      <div className="hg-root">
        <div className="hg-inner">

          <div className="hg-label">Discovery</div>
          <div className="hg-title">💎 Hidden Gems</div>
          <div className="hg-sub">
            Highly rated titles that haven't been reviewed much yet — these are the ones worth discovering.
          </div>

          <div className="hg-criteria">
            <div className="hg-chip"><span className="hg-chip-dot" />User rating ≥ 8.0</div>
            <div className="hg-chip"><span className="hg-chip-dot" />Fewer than 3 reviews</div>
            <div className="hg-chip"><span className="hg-chip-dot" />All types</div>
          </div>

          <div className="hg-meta">
            {loading ? 'Loading…' : `${gems.length} hidden gem${gems.length !== 1 ? 's' : ''} found`}
          </div>

          {loading && (
            <div className="hg-loading-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="hg-skeleton">
                  <div className="hg-skeleton-poster" />
                  <div className="hg-skeleton-body">
                    <div className="hg-skeleton-line" />
                    <div className="hg-skeleton-line short" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && gems.length === 0 && (
            <div className="hg-empty">
              <div className="hg-empty-icon">💎</div>
              <div className="hg-empty-title">No hidden gems yet</div>
              <div className="hg-empty-sub">Rate more titles and they'll appear here once they qualify</div>
            </div>
          )}

          {!loading && gems.length > 0 && (
            <div className="hg-grid">
              {gems.map(m => (
                <div key={m.id} className="hg-card-wrap">
                  <MediaCard media={m} onClick={() => navigate('detail', m.id)} />
                  <span className="hg-gem-badge">💎 Hidden Gem</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
