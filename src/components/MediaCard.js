import React from 'react'
import supabase from '../config/supabaseClient'

function getPosterUrl(posterUrl) {
  if (!posterUrl) return null
  if (posterUrl.startsWith('http')) return posterUrl
  const { data } = supabase.storage.from('posters').getPublicUrl(posterUrl)
  return data.publicUrl
}

export default function MediaCard({ media, onClick }) {
  const posterUrl = getPosterUrl(media.poster_url)

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 12, overflow: 'hidden',
        border: '0.5px solid #eee', cursor: 'pointer',
        transition: 'box-shadow 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
    >
      {/* Poster */}
      <div style={{ height: 200, background: '#f0f0ee', position: 'relative', overflow: 'hidden' }}>
        {posterUrl ? (
          <img src={posterUrl} alt={media.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#bbb', fontSize: 13,
          }}>
            No poster
          </div>
        )}
        <span style={{
          position: 'absolute', top: 8, left: 8,
          background: media.type === 'movie' ? '#E6F1FB' : '#EEEDFE',
          color: media.type === 'movie' ? '#0C447C' : '#3C3489',
          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
        }}>
          {media.type === 'movie' ? 'Movie' : 'TV'}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {media.title}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#888' }}>
            {media.release_year || '—'}{media.genre ? ` · ${media.genre}` : ''}
          </span>
          {media.avg_rating > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600 }}>
              <span style={{ color: '#F5C518', fontSize: 11 }}>★</span>
              {media.avg_rating}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
