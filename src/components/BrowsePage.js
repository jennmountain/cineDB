import React, { useState, useEffect, useCallback } from 'react'
import supabase from '../config/supabaseClient'
import MediaCard from './MediaCard'

const PAGE_SIZE = 12
const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Documentary', 'Animation', 'Crime']

export default function BrowsePage({ navigate }) {
  const [media, setMedia]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState('all')   // all | movie | tv
  const [genreFilter, setGenreFilter] = useState('')
  const [sortBy, setSortBy]     = useState('created_at')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)

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

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Search bar */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search movies & TV series…"
          style={{
            width: '100%', border: '0.5px solid #ddd', borderRadius: 10,
            padding: '11px 16px', fontSize: 14, outline: 'none', background: '#fff',
          }}
        />
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        {/* Type filter */}
        {['all', 'movie', 'tv'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
            border: typeFilter === t ? '0.5px solid #111' : '0.5px solid #ddd',
            background: typeFilter === t ? '#111' : '#fff',
            color: typeFilter === t ? '#fff' : '#555',
            cursor: 'pointer',
          }}>
            {t === 'all' ? 'All' : t === 'movie' ? 'Movies' : 'TV Series'}
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: '#eee', margin: '0 4px' }} />

        {/* Genre */}
        <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)} style={{
          border: '0.5px solid #ddd', borderRadius: 20, padding: '6px 12px',
          fontSize: 12, background: '#fff', outline: 'none', cursor: 'pointer',
        }}>
          <option value="">All genres</option>
          {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
          border: '0.5px solid #ddd', borderRadius: 20, padding: '6px 12px',
          fontSize: 12, background: '#fff', outline: 'none', cursor: 'pointer', marginLeft: 'auto',
        }}>
          <option value="created_at">Newest first</option>
          <option value="avg_rating">Top rated</option>
          <option value="release_year">Release year</option>
          <option value="title">Title A–Z</option>
        </select>
      </div>

      {/* Count */}
      <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
        {loading ? 'Loading…' : `${total} result${total !== 1 ? 's' : ''}`}
      </div>

      {error && <p style={{ color: '#c0392b', fontSize: 13 }}>{error}</p>}

      {/* Grid */}
      {!loading && media.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎬</div>
          <p style={{ fontWeight: 500 }}>No results found</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Try a different search or filter</p>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
      }}>
        {media.map(m => (
          <MediaCard key={m.id} media={m} onClick={() => navigate('detail', m.id)} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 32 }}>
          <PageBtn label="← Prev" disabled={page === 1} onClick={() => setPage(p => p - 1)} />
          <span style={{ fontSize: 13, color: '#666' }}>Page {page} of {totalPages}</span>
          <PageBtn label="Next →" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} />
        </div>
      )}
    </div>
  )
}

function PageBtn({ label, disabled, onClick }) {
  return (
    <button disabled={disabled} onClick={onClick} style={{
      padding: '7px 14px', borderRadius: 8, border: '0.5px solid #ddd',
      background: '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 13, opacity: disabled ? 0.4 : 1,
    }}>
      {label}
    </button>
  )
}
