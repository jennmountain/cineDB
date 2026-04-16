import React, { useState, useEffect } from 'react'
import supabase from '../config/supabaseClient'
import MediaCard from './MediaCard'

const TABS = [
  { value: 'all',           label: 'All' },
  { value: 'favourite',     label: '♥ Favourites' },
  { value: 'want_to_watch', label: 'Want to Watch' },
  { value: 'watched',       label: 'Watched' },
]

export default function WatchlistPage({ navigate, session }) {
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
    if (tab === 'all')           return true
    if (tab === 'favourite')     return item.is_favourite
    return item.watch_status === tab
  }

  function countTab(value) {
    if (value === 'favourite') return items.filter(i => i.is_favourite).length
    return items.filter(i => i.watch_status === value).length
  }

  function itemLabel(item) {
    const parts = []
    if (item.watch_status) parts.push(item.watch_status.replace(/_/g, ' '))
    if (item.is_favourite)  parts.push('♥')
    return parts.join(' · ')
  }

  const filtered = items.filter(matchesTab)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>My List</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)} style={{
            padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
            cursor: 'pointer', border: '0.5px solid',
            borderColor: tab === t.value ? '#111' : '#ddd',
            background: tab === t.value ? '#111' : '#fff',
            color: tab === t.value ? '#fff' : '#555',
          }}>
            {t.label}
            {t.value !== 'all' && (
              <span style={{ marginLeft: 5, opacity: 0.7 }}>({countTab(t.value)})</span>
            )}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#888', fontSize: 14 }}>Loading…</p>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <p style={{ fontWeight: 500 }}>Nothing here yet</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Browse movies and add them to your list</p>
          <button onClick={() => navigate('browse')} style={{
            marginTop: 16, background: '#111', color: '#fff', border: 'none',
            borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer',
          }}>
            Browse movies
          </button>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
      }}>
        {filtered.map(item => (
          <div key={item.media.id} style={{ position: 'relative' }}>
            <MediaCard media={item.media} onClick={() => navigate('detail', item.media.id)} />
            {itemLabel(item) && (
              <span style={{
                position: 'absolute', bottom: 50, right: 8,
                background: 'rgba(0,0,0,0.6)', color: '#fff',
                fontSize: 10, padding: '2px 7px', borderRadius: 10,
              }}>
                {itemLabel(item)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
