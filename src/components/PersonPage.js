import React, { useState, useEffect } from 'react'
import supabase from '../config/supabaseClient'

const ROLE_ORDER  = ['director', 'writer', 'producer', 'actor']
const ROLE_LABELS = { director: 'Director', writer: 'Writer', producer: 'Producer', actor: 'Actor' }
const ROLE_COLORS = {
  director: { bg: '#FEF3E2', color: '#92400E' },
  writer:   { bg: '#F0FDF4', color: '#166534' },
  producer: { bg: '#EFF6FF', color: '#1E40AF' },
  actor:    { bg: '#FAF5FF', color: '#6B21A8' },
}

function getPhotoUrl(photoUrl) {
  if (!photoUrl) return null
  if (photoUrl.startsWith('http')) return photoUrl
  const { data } = supabase.storage.from('posters').getPublicUrl(photoUrl)
  return data.publicUrl
}

function getPosterUrl(posterUrl) {
  if (!posterUrl) return null
  if (posterUrl.startsWith('http')) return posterUrl
  const { data } = supabase.storage.from('posters').getPublicUrl(posterUrl)
  return data.publicUrl
}

export default function PersonPage({ personId, navigate }) {
  const [person,  setPerson]  = useState(null)
  const [credits, setCredits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => { if (personId) load() }, [personId])

  async function load() {
    setLoading(true)
    setError(null)

    const [{ data: p, error: pe }, { data: c, error: ce }] = await Promise.all([
      supabase.from('people').select('*').eq('id', personId).single(),
      supabase
        .from('media_credits')
        .select('role, character_name, credit_order, media(id, title, type, genre, release_year, avg_rating, poster_url)')
        .eq('person_id', personId)
        .order('credit_order'),
    ])

    if (pe) { setError(pe.message); setLoading(false); return }
    setPerson(p)
    setCredits(c || [])
    setLoading(false)
  }

  if (loading) return <div style={{ padding: 40, color: '#888', fontSize: 14 }}>Loading…</div>
  if (error)   return <div style={{ padding: 40, color: '#c0392b', fontSize: 14 }}>{error}</div>
  if (!person) return null

  // Group credits by role, sort each group by credit_order
  const byRole = {}
  for (const c of credits) {
    if (!byRole[c.role]) byRole[c.role] = []
    byRole[c.role].push(c)
  }
  const activeRoles = ROLE_ORDER.filter(r => byRole[r]?.length > 0)

  // Unique media titles this person has worked on
  const totalTitles = new Set(credits.map(c => c.media?.id)).size

  const photoUrl = getPhotoUrl(person.photo_url)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

      {/* Back */}
      <button onClick={() => navigate('browse')} style={{
        background: 'none', border: 'none', color: '#888', fontSize: 13,
        cursor: 'pointer', marginBottom: 20, padding: 0,
      }}>
        ← Back to browse
      </button>

      {/* Hero */}
      <div style={{ display: 'flex', gap: 28, marginBottom: 36, flexWrap: 'wrap' }}>

        {/* Photo */}
        <div style={{
          width: 160, height: 200, borderRadius: 12, overflow: 'hidden',
          background: '#f0f0ee', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {photoUrl
            ? <img src={photoUrl} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 56, lineHeight: 1 }}>👤</span>
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>{person.name}</h1>

          {/* Years */}
          {(person.born_year || person.died_year) && (
            <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
              {person.born_year && `Born ${person.born_year}`}
              {person.born_year && person.died_year && ' · '}
              {person.died_year && `Died ${person.died_year}`}
            </p>
          )}

          {/* Role badges */}
          {activeRoles.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {activeRoles.map(role => (
                <span key={role} style={{
                  background: ROLE_COLORS[role].bg,
                  color: ROLE_COLORS[role].color,
                  fontSize: 11, fontWeight: 600,
                  padding: '3px 9px', borderRadius: 10,
                }}>
                  {ROLE_LABELS[role]}
                </span>
              ))}
            </div>
          )}

          {/* Credit count */}
          {totalTitles > 0 && (
            <p style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>
              {totalTitles} title{totalTitles !== 1 ? 's' : ''}
            </p>
          )}

          {/* Bio */}
          {person.bio && (
            <p style={{ fontSize: 14, color: '#444', lineHeight: 1.75, maxWidth: 560 }}>
              {person.bio}
            </p>
          )}
        </div>
      </div>

      {/* Filmography */}
      {credits.length > 0 && (
        <div style={{ borderTop: '0.5px solid #eee', paddingTop: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Filmography</h2>

          {ROLE_ORDER.filter(role => byRole[role]).map(role => (
            <div key={role} style={{ marginBottom: 32 }}>
              {/* Role heading */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
                  textTransform: 'uppercase', color: '#aaa',
                }}>
                  {ROLE_LABELS[role]}
                </span>
                <div style={{ flex: 1, height: '0.5px', background: '#eee' }} />
              </div>

              {/* Credits list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {byRole[role].map(({ media: m, character_name }) => (
                  <div
                    key={m.id + role}
                    onClick={() => navigate('detail', m.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '10px 14px', borderRadius: 10,
                      background: '#fff', border: '0.5px solid #eee',
                      cursor: 'pointer', transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#bbb'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#eee'}
                  >
                    {/* Mini poster */}
                    <div style={{
                      width: 36, height: 50, borderRadius: 5, overflow: 'hidden',
                      background: '#eee', flexShrink: 0,
                    }}>
                      {getPosterUrl(m.poster_url)
                        ? <img src={getPosterUrl(m.poster_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', background: '#e8e8e4' }} />
                      }
                    </div>

                    {/* Title + meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                        {m.release_year && `${m.release_year} · `}
                        {m.type === 'movie' ? 'Movie' : 'TV Series'}
                        {character_name && ` · as ${character_name}`}
                      </div>
                    </div>

                    {/* Rating */}
                    {m.avg_rating > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#888', flexShrink: 0 }}>
                        <span style={{ color: '#F5C518' }}>★</span>
                        <span style={{ fontWeight: 500 }}>{m.avg_rating}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {credits.length === 0 && (
        <div style={{ borderTop: '0.5px solid #eee', paddingTop: 28 }}>
          <p style={{ color: '#aaa', fontSize: 13 }}>No credits found.</p>
        </div>
      )}
    </div>
  )
}
