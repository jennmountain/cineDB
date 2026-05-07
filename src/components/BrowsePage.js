import React, { useState, useEffect, useCallback } from 'react'
import supabase from '../config/supabaseClient'
import MediaCard from './MediaCard'

const PAGE_SIZE = 12
const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Documentary', 'Animation', 'Crime']

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .browse-root {
    font-family: 'DM Sans', sans-serif;
    background: #F8F6F2;
    min-height: 100vh;
  }

  .browse-inner {
    padding: 32px 28px;
    max-width: 1280px;
    margin: 0 auto;
  }

  .browse-header {
    margin-bottom: 28px;
  }

  .browse-title {
    font-family: 'DM Serif Display', serif;
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #B5622A;
    margin-bottom: 6px;
  }

  .search-wrap {
    position: relative;
  }

  .search-input {
    width: 100%;
    border: none;
    border-bottom: 1.5px solid #D4C9BA;
    border-radius: 0;
    padding: 12px 0 12px 0;
    font-size: 22px;
    font-family: 'DM Serif Display', serif;
    outline: none;
    background: transparent;
    color: #1C1C1A;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  .search-input::placeholder {
    color: #C4BAB0;
  }

  .search-input:focus {
    border-bottom-color: #B5622A;
  }

  .filters-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 24px;
    align-items: center;
  }

  .filter-pill {
    padding: 6px 16px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 500;
    border: 1.5px solid #D4C9BA;
    background: transparent;
    color: #6B6660;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.02em;
    transition: all 0.15s;
  }

  .filter-pill:hover {
    border-color: #B5622A;
    color: #B5622A;
  }

  .filter-pill.active {
    background: #1C1C1A;
    border-color: #1C1C1A;
    color: #F8F6F2;
  }

  .filter-select {
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 12px;
    border: 1.5px solid #D4C9BA;
    background: transparent;
    color: #6B6660;
    outline: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    appearance: none;
    padding-right: 28px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    transition: border-color 0.15s;
  }

  .filter-select:hover {
    border-color: #B5622A;
  }

  .filter-divider {
    width: 1px;
    height: 18px;
    background: #D4C9BA;
    margin: 0 2px;
  }

  .sort-select {
    margin-left: auto;
  }

  .results-meta {
    font-size: 12px;
    color: #9A9390;
    margin-bottom: 20px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-weight: 500;
  }

  .media-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 40px;
  }

  @media (max-width: 1100px) {
    .media-grid { grid-template-columns: repeat(3, 1fr); }
  }

  @media (max-width: 800px) {
    .media-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 560px) {
    .media-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .empty-state {
    text-align: center;
    padding: 80px 0;
    color: #9A9390;
  }

  .empty-icon {
    font-size: 40px;
    margin-bottom: 14px;
  }

  .empty-title {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    color: #4A4440;
    margin-bottom: 6px;
  }

  .empty-sub {
    font-size: 13px;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    padding-top: 8px;
    padding-bottom: 40px;
  }

  .page-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1.5px solid #D4C9BA;
    background: transparent;
    color: #6B6660;
    cursor: pointer;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .page-btn:hover:not(:disabled) {
    border-color: #B5622A;
    color: #B5622A;
  }

  .page-btn.active {
    background: #1C1C1A;
    border-color: #1C1C1A;
    color: #F8F6F2;
  }

  .page-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .page-arrow {
    padding: 0 14px;
    width: auto;
    font-size: 12px;
    letter-spacing: 0.04em;
  }

  .page-info {
    font-size: 12px;
    color: #9A9390;
    padding: 0 8px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-weight: 500;
  }

  .loading-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .skeleton-card {
    border-radius: 10px;
    overflow: hidden;
    background: #EDE9E3;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-poster {
    height: 200px;
    background: #E0DBD4;
  }

  .skeleton-body {
    padding: 12px;
  }

  .skeleton-line {
    height: 12px;
    border-radius: 4px;
    background: #D4CFC8;
    margin-bottom: 8px;
  }

  .skeleton-line.short {
    width: 60%;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
`

export default function BrowsePage({ navigate }) {
  const [media, setMedia]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [search, setSearch]         = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [genreFilter, setGenreFilter] = useState('')
  const [sortBy, setSortBy]         = useState('created_at')
  const [page, setPage]             = useState(1)
  const [total, setTotal]           = useState(0)

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('media').select('*', { count: 'exact' })

    if (search.trim()) {
      query = query.textSearch('fts', search.trim().split(' ').join(' & '))
    }
    if (typeFilter !== 'all') query = query.eq('type', typeFilter)
    if (genreFilter) query = query.eq('genre', genreFilter)

    const ascending = sortBy === 'title'
    query = query
      .order(sortBy, { ascending })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    const { data, error, count } = await query

    if (error) setError(error.message)
    else { setMedia(data); setTotal(count || 0) }
    setLoading(false)
  }, [search, typeFilter, genreFilter, sortBy, page])

  useEffect(() => { fetchMedia() }, [fetchMedia])
  useEffect(() => { setPage(1) }, [search, typeFilter, genreFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const getPageNumbers = () => {
    const pages = []
    const delta = 2
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <>
      <style>{styles}</style>
      <div className="browse-root">
        <div className="browse-inner">

          {/* Header + Search */}
          <div className="browse-header">
            <div className="browse-title">Discover</div>
            <div className="search-wrap">
              <input
                className="search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search movies & TV series…"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="filters-row">
            {[['all', 'All'], ['movie', 'Movies'], ['tv', 'TV Series']].map(([val, label]) => (
              <button
                key={val}
                className={`filter-pill${typeFilter === val ? ' active' : ''}`}
                onClick={() => setTypeFilter(val)}
              >
                {label}
              </button>
            ))}

            <div className="filter-divider" />

            <select
              className="filter-select"
              value={genreFilter}
              onChange={e => setGenreFilter(e.target.value)}
            >
              <option value="">All genres</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            <select
              className={`filter-select sort-select`}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="created_at">Newest first</option>
              <option value="avg_rating">Top rated</option>
              <option value="release_year">Release year</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>

          {/* Results count */}
          <div className="results-meta">
            {loading ? 'Loading…' : `${total} result${total !== 1 ? 's' : ''}`}
          </div>

          {error && <p style={{ color: '#c0392b', fontSize: 13 }}>{error}</p>}

          {/* Loading skeletons */}
          {loading && (
            <div className="loading-grid">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-poster" />
                  <div className="skeleton-body">
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && media.length === 0 && !error && (
            <div className="empty-state">
              <div className="empty-icon">🎬</div>
              <div className="empty-title">No results found</div>
              <div className="empty-sub">Try a different search or filter</div>
            </div>
          )}

          {/* Grid */}
          {!loading && media.length > 0 && (
            <div className="media-grid">
              {media.map(m => (
                <MediaCard key={m.id} media={m} onClick={() => navigate('detail', m.id)} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn page-arrow"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                ← Prev
              </button>

              {page > 3 && (
                <>
                  <button className="page-btn" onClick={() => setPage(1)}>1</button>
                  {page > 4 && <span className="page-info">…</span>}
                </>
              )}

              {getPageNumbers().map(n => (
                <button
                  key={n}
                  className={`page-btn${n === page ? ' active' : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}

              {page < totalPages - 2 && (
                <>
                  {page < totalPages - 3 && <span className="page-info">…</span>}
                  <button className="page-btn" onClick={() => setPage(totalPages)}>{totalPages}</button>
                </>
              )}

              <button
                className="page-btn page-arrow"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next →
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
