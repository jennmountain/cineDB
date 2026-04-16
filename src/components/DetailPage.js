import React, { useState, useEffect, useCallback } from 'react'
import supabase from '../config/supabaseClient'

function getPosterUrl(posterUrl) {
  if (!posterUrl) return null
  if (posterUrl.startsWith('http')) return posterUrl
  const { data } = supabase.storage.from('posters').getPublicUrl(posterUrl)
  return data.publicUrl
}

const WATCH_STATUSES = [
  { value: 'want_to_watch', label: '+ Want to Watch' },
  { value: 'watched',       label: '✓ Watched' },
]

const CREDIT_ROLE_ORDER  = ['director', 'writer', 'producer', 'actor']
const CREDIT_ROLE_LABELS = { director: 'Director', writer: 'Writer', producer: 'Producer', actor: 'Cast' }

export default function DetailPage({ mediaId, navigate, session, profile }) {
  const [media, setMedia]             = useState(null)
  const [credits, setCredits]         = useState([])
  const [reviews, setReviews]         = useState([])
  const [watchStatus,  setWatchStatus]  = useState(null)   // 'want_to_watch' | 'watched' | null
  const [isFavourite,  setIsFavourite]  = useState(false)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  const [rating, setRating]           = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText]   = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [reviewError, setReviewError] = useState(null)
  const [userReview, setUserReview]   = useState(null)
  const [editingReview, setEditingReview] = useState(false)

  useEffect(() => {
    if (mediaId) load()
  }, [mediaId])

  async function load() {
    setLoading(true)
    const [{ data: m, error: me }, { data: r }, { data: w }, { data: c }] = await Promise.all([
      supabase.from('media').select('*').eq('id', mediaId).single(),
      supabase.from('reviews').select('*, profiles(username)').eq('media_id', mediaId).order('created_at', { ascending: false }),
      supabase.from('watchlist').select('watch_status, is_favourite').eq('media_id', mediaId).eq('user_id', session.user.id).maybeSingle(),
      supabase.from('media_credits').select('role, character_name, credit_order, people(id, name)').eq('media_id', mediaId).order('credit_order'),
    ])
    if (me) setError(me.message)
    else {
      setMedia(m)
      setCredits(c || [])
      setReviews(r || [])
      setWatchStatus(w?.watch_status || null)
      setIsFavourite(w?.is_favourite || false)
      const myReview = (r || []).find(rv => rv.user_id === session.user.id)
      if (myReview) {
        setUserReview(myReview)
        setRating(myReview.rating)
        setReviewText(myReview.content || '')
      }
    }
    setLoading(false)
  }

  async function handleWatchStatus(status) {
    const next = watchStatus === status ? null : status   // toggle off if same
    if (next === null && !isFavourite) {
      await supabase.from('watchlist').delete().eq('media_id', mediaId).eq('user_id', session.user.id)
    } else {
      await supabase.from('watchlist').upsert(
        { user_id: session.user.id, media_id: mediaId, watch_status: next, is_favourite: isFavourite },
        { onConflict: 'user_id,media_id' }
      )
    }
    setWatchStatus(next)
  }

  async function handleFavourite() {
    const next = !isFavourite
    if (!next && watchStatus === null) {
      await supabase.from('watchlist').delete().eq('media_id', mediaId).eq('user_id', session.user.id)
    } else {
      await supabase.from('watchlist').upsert(
        { user_id: session.user.id, media_id: mediaId, watch_status: watchStatus, is_favourite: next },
        { onConflict: 'user_id,media_id' }
      )
    }
    setIsFavourite(next)
  }

  async function handleSubmitReview() {
    if (!rating) { setReviewError('Please select a rating.'); return }
    setSubmitting(true)
    setReviewError(null)

    const payload = { user_id: session.user.id, media_id: mediaId, rating, content: reviewText.trim() || null }
    const { error } = userReview && !editingReview
      ? { error: null }
      : await supabase.from('reviews').upsert(payload, { onConflict: 'user_id,media_id' })

    if (error) setReviewError(error.message)
    else { setEditingReview(false); load() }
    setSubmitting(false)
  }

  async function handleDeleteReview() {
    if (!window.confirm('Delete your review?')) return
    await supabase.from('reviews').delete().eq('user_id', session.user.id).eq('media_id', mediaId)
    setUserReview(null)
    setRating(0)
    setReviewText('')
    load()
  }

  if (loading) return <div style={{ padding: 40, color: '#888', fontSize: 14 }}>Loading…</div>
  if (error)   return <div style={{ padding: 40, color: '#c0392b', fontSize: 14 }}>{error}</div>
  if (!media)  return null

  const posterUrl = getPosterUrl(media.poster_url)
  const displayRating = hoverRating || rating

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
        {/* Poster */}
        <div style={{ width: 200, height: 300, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#eee' }}>
          {posterUrl
            ? <img src={posterUrl} alt={media.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13 }}>No poster</div>
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{
              background: media.type === 'movie' ? '#E6F1FB' : '#EEEDFE',
              color: media.type === 'movie' ? '#0C447C' : '#3C3489',
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
            }}>
              {media.type === 'movie' ? 'Movie' : 'TV Series'}
            </span>
            {media.genre && <span style={{ fontSize: 12, color: '#888' }}>{media.genre}</span>}
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>{media.title}</h1>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            {media.release_year && <Stat label="Year" value={media.release_year} />}
            {media.runtime_minutes && <Stat label="Runtime" value={`${media.runtime_minutes} min`} />}
            {media.avg_rating > 0 && (
              <Stat label="Rating" value={
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ color: '#F5C518' }}>★</span>
                  <strong>{media.avg_rating}</strong>
                  <span style={{ color: '#888', fontWeight: 400 }}>/10</span>
                </span>
              } />
            )}
          </div>

          {media.overview && (
            <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, marginBottom: 20 }}>{media.overview}</p>
          )}

          {/* Watchlist buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {WATCH_STATUSES.map(({ value, label }) => (
              <button key={value} onClick={() => handleWatchStatus(value)} style={{
                padding: '7px 13px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', border: '0.5px solid',
                borderColor: watchStatus === value ? '#111' : '#ddd',
                background: watchStatus === value ? '#111' : '#fff',
                color: watchStatus === value ? '#fff' : '#555',
              }}>
                {label}
              </button>
            ))}
            <button onClick={handleFavourite} style={{
              padding: '7px 13px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', border: '0.5px solid',
              borderColor: isFavourite ? '#e74c3c' : '#ddd',
              background: isFavourite ? '#fff0f0' : '#fff',
              color: isFavourite ? '#e74c3c' : '#555',
            }}>
              {isFavourite ? '♥ Favourite' : '♡ Favourite'}
            </button>
          </div>
        </div>
      </div>

      {/* Cast & Crew */}
      {credits.length > 0 && (() => {
        const byRole = {}
        for (const c of credits) {
          if (!byRole[c.role]) byRole[c.role] = []
          byRole[c.role].push(c)
        }
        return (
          <div style={{ borderTop: '0.5px solid #eee', paddingTop: 24, marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Cast &amp; Crew</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CREDIT_ROLE_ORDER.filter(role => byRole[role]).map(role => (
                <div key={role} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: 12, color: '#999', fontWeight: 500,
                    minWidth: 72, paddingTop: 1, flexShrink: 0,
                  }}>
                    {CREDIT_ROLE_LABELS[role]}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 0', alignItems: 'center' }}>
                    {byRole[role].map((c, i) => (
                      <React.Fragment key={c.people.id + role}>
                        <button
                          onClick={() => navigate('person', c.people.id)}
                          style={{
                            background: 'none', border: 'none', padding: '0 2px',
                            fontSize: 13, fontWeight: 500, color: '#111',
                            cursor: 'pointer', textDecoration: 'underline',
                            textDecorationColor: '#ddd', textUnderlineOffset: 2,
                          }}
                        >
                          {c.people.name}
                        </button>
                        {c.character_name && (
                          <span style={{ fontSize: 12, color: '#888' }}>
                            &nbsp;as {c.character_name}
                          </span>
                        )}
                        {i < byRole[role].length - 1 && (
                          <span style={{ color: '#ccc', fontSize: 12, marginRight: 4 }}>,</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Review section */}
      <div style={{ borderTop: '0.5px solid #eee', paddingTop: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
          Reviews <span style={{ color: '#888', fontWeight: 400, fontSize: 14 }}>({reviews.length})</span>
        </h2>

        {/* Write / Edit review */}
        {(!userReview || editingReview) && (
          <div style={{ background: '#fff', border: '0.5px solid #eee', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
              {userReview ? 'Edit your review' : 'Rate & review'}
            </p>

            {/* Star rating */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 20, padding: 2, color: n <= displayRating ? '#F5C518' : '#ddd',
                    transition: 'color 0.1s',
                  }}
                >★</button>
              ))}
              {rating > 0 && <span style={{ fontSize: 13, color: '#888', marginLeft: 6, alignSelf: 'center' }}>{rating}/10</span>}
            </div>

            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Write a review (optional)…"
              rows={3}
              style={{
                width: '100%', border: '0.5px solid #ddd', borderRadius: 8,
                padding: '10px 12px', fontSize: 13, resize: 'vertical',
                outline: 'none', background: '#fafafa', marginBottom: 10,
              }}
            />

            {reviewError && <p style={{ fontSize: 12, color: '#c0392b', marginBottom: 8 }}>{reviewError}</p>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSubmitReview} disabled={submitting} style={{
                background: '#111', color: '#fff', border: 'none',
                borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer',
              }}>
                {submitting ? 'Saving…' : userReview ? 'Update review' : 'Submit review'}
              </button>
              {editingReview && (
                <button onClick={() => setEditingReview(false)} style={{
                  background: '#fff', border: '0.5px solid #ddd', borderRadius: 8,
                  padding: '8px 14px', fontSize: 13, cursor: 'pointer',
                }}>Cancel</button>
              )}
            </div>
          </div>
        )}

        {/* User's existing review (non-edit mode) */}
        {userReview && !editingReview && (
          <div style={{ background: '#f9f9f7', border: '0.5px solid #e8e8e4', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Your review</span>
                <StarRating value={userReview.rating} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditingReview(true)} style={s.smallBtn}>Edit</button>
                <button onClick={handleDeleteReview} style={{ ...s.smallBtn, color: '#c0392b' }}>Delete</button>
              </div>
            </div>
            {userReview.content && <p style={{ fontSize: 13, color: '#444', lineHeight: 1.6 }}>{userReview.content}</p>}
          </div>
        )}

        {/* All reviews */}
        {reviews.filter(r => r.user_id !== session.user.id).map(r => (
          <div key={r.id} style={{ borderBottom: '0.5px solid #f0f0f0', paddingBottom: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: '#111',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, flexShrink: 0,
              }}>
                {(r.profiles?.username || '?')[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{r.profiles?.username || 'Unknown'}</span>
              <StarRating value={r.rating} />
              <span style={{ fontSize: 11, color: '#aaa', marginLeft: 'auto' }}>
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>
            {r.content && <p style={{ fontSize: 13, color: '#444', lineHeight: 1.6, paddingLeft: 38 }}>{r.content}</p>}
          </div>
        ))}

        {reviews.length === 0 && (
          <p style={{ color: '#aaa', fontSize: 13 }}>No reviews yet. Be the first!</p>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{value}</div>
    </div>
  )
}

function StarRating({ value }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 12 }}>
      <span style={{ color: '#F5C518' }}>★</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
      <span style={{ color: '#aaa' }}>/10</span>
    </span>
  )
}

const s = {
  smallBtn: {
    background: 'none', border: '0.5px solid #ddd', borderRadius: 6,
    padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: '#555',
  },
}
