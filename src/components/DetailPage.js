import React, { useState, useEffect } from 'react'
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
  const [seasons, setSeasons]         = useState([])
  const [watchStatus,  setWatchStatus]  = useState(null)
  const [isFavourite,  setIsFavourite]  = useState(false)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [openSeasons, setOpenSeasons] = useState({})

  const [rating, setRating]           = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText]   = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [reviewError, setReviewError] = useState(null)
  const [userReview, setUserReview]   = useState(null)
  const [editingReview, setEditingReview] = useState(false)
  const [isRecommended, setIsRecommended] = useState(false)
  const [recSubmitting, setRecSubmitting] = useState(false)

  useEffect(() => {
    if (mediaId) load()
  }, [mediaId])

  async function load() {
    setLoading(true)
    const [{ data: m, error: me }, { data: r }, { data: w }, { data: c }, { data: rec }, { data: s }] = await Promise.all([
      supabase.from('media').select('*').eq('id', mediaId).single(),
      supabase.from('reviews').select('*, profiles(username)').eq('media_id', mediaId).order('created_at', { ascending: false }),
      supabase.from('watchlist').select('watch_status, is_favourite').eq('media_id', mediaId).eq('user_id', session.user.id).maybeSingle(),
      supabase.from('media_credits').select('role, character_name, credit_order, people(id, name)').eq('media_id', mediaId).order('credit_order'),
      supabase.from('recommendations').select('id').eq('media_id', mediaId).eq('user_id', session.user.id).maybeSingle(),
      supabase.from('seasons').select('*, episodes(id, episode_num, title, runtime_minutes, description)').eq('media_id', mediaId).order('season_num').order('episode_num', { referencedTable: 'episodes' }),
    ])
    if (me) setError(me.message)
    else {
      setMedia(m)
      setCredits(c || [])
      setReviews(r || [])
      setSeasons(s || [])
      setWatchStatus(w?.watch_status || null)
      setIsFavourite(w?.is_favourite || false)
      setIsRecommended(!!rec)
      setIsRecommended(!!rec)
      const myReview = (r || []).find(rv => rv.user_id === session.user.id)
      if (myReview) {
        setUserReview(myReview)
        setRating(myReview.rating)
        setReviewText(myReview.content || '')
      }
      // Open first season by default
      if (s && s.length > 0) setOpenSeasons({ [s[0].id]: true })
    }
    setLoading(false)
  }

  function toggleSeason(id) {
    setOpenSeasons(prev => ({ ...prev, [id]: !prev[id] }))
  }

  async function handleWatchStatus(status) {
    const next = watchStatus === status ? null : status
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

  async function handleRecommend() {
    setRecSubmitting(true)
    if (isRecommended) {
      await supabase.from('recommendations').delete()
        .eq('media_id', mediaId).eq('user_id', session.user.id)
      setIsRecommended(false)
    } else {
      await supabase.from('recommendations').insert({
        media_id: mediaId,
        user_id: session.user.id,
      })
      setIsRecommended(true)
    }
    setRecSubmitting(false)
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
    setUserReview(null); setRating(0); setReviewText(''); load()
  }

  if (loading) return <div style={{ padding: 40, color: '#9A9390', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>Loading…</div>
  if (error)   return <div style={{ padding: 40, color: '#c0392b', fontSize: 14 }}>{error}</div>
  if (!media)  return null

  const posterUrl = getPosterUrl(media.poster_url)
  const displayRating = hoverRating || rating
  const isTv = media.type === 'tv'

  const yearRange = media.release_year
    ? isTv && media.end_year
      ? `${media.release_year}–${media.end_year}`
      : isTv && !media.end_year
      ? `${media.release_year}–present`
      : `${media.release_year}`
    : null

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px', fontFamily: 'DM Sans, sans-serif', background: '#F8F6F2', minHeight: '100vh' }}>

      {/* Back */}
      <button onClick={() => navigate('browse')} style={{
        background: 'none', border: 'none', color: '#9A9390', fontSize: 12,
        cursor: 'pointer', marginBottom: 24, padding: 0,
        fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.04em',
        textTransform: 'uppercase', fontWeight: 500,
      }}>
        ← Back to browse
      </button>

      {/* Hero */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 40, flexWrap: 'wrap' }}>
        {/* Poster */}
        <div style={{
          width: 200, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
          background: '#EDE9E3', border: '1px solid #E4DDD4',
          aspectRatio: '2/3',
        }}>
          {posterUrl
            ? <img src={posterUrl} alt={media.title} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4BAB0', fontSize: 13 }}>No poster</div>
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 220 }}>
          {/* Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{
              background: '#1C1C1A', color: '#F8F6F2',
              fontSize: 9, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {isTv ? 'TV Series' : 'Film'}
            </span>
            {media.mpa_rating && (
              <span style={{
                border: '1.5px solid #D4C9BA', color: '#6B6660',
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
              }}>
                {media.mpa_rating}
              </span>
            )}
            {media.genre && <span style={{ fontSize: 12, color: '#9A9390' }}>{media.genre}</span>}
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 400, marginBottom: 16, lineHeight: 1.2, fontFamily: 'DM Serif Display, serif', color: '#1C1C1A' }}>
            {media.title}
          </h1>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 18, flexWrap: 'wrap' }}>
            {yearRange && <Stat label="Year" value={yearRange} />}
            {media.runtime_minutes && (
              <Stat label={isTv ? 'Ep. Runtime' : 'Runtime'} value={`${media.runtime_minutes} min`} />
            )}
            {isTv && media.seasons  && <Stat label="Seasons"  value={media.seasons} />}
            {isTv && media.episodes && <Stat label="Episodes" value={media.episodes} />}
            {media.imdb_rating && (
              <Stat label="RT Score" value={
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontSize: 13 }}>🍅</span>
                  <strong>{media.imdb_rating}%</strong>
                </span>
              } />
            )}
            {media.avg_rating > 0 && (
              <Stat label="User Rating" value={
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ color: '#B5622A' }}>★</span>
                  <strong>{media.avg_rating}</strong>
                  <span style={{ color: '#9A9390', fontWeight: 400 }}>/10</span>
                </span>
              } />
            )}
          </div>

          {media.overview && (
            <p style={{ fontSize: 14, color: '#4A4440', lineHeight: 1.7, marginBottom: 22 }}>{media.overview}</p>
          )}

          {/* Watchlist buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {WATCH_STATUSES.map(({ value, label }) => (
              <button key={value} onClick={() => handleWatchStatus(value)} style={{
                padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', border: '1.5px solid',
                borderColor: watchStatus === value ? '#1C1C1A' : '#D4C9BA',
                background: watchStatus === value ? '#1C1C1A' : 'transparent',
                color: watchStatus === value ? '#F8F6F2' : '#6B6660',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'all 0.15s',
              }}>
                {label}
              </button>
            ))}
            <button onClick={handleFavourite} style={{
              padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', border: '1.5px solid',
              borderColor: isFavourite ? '#B5622A' : '#D4C9BA',
              background: isFavourite ? '#FDF0E8' : 'transparent',
              color: isFavourite ? '#B5622A' : '#6B6660',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.15s',
            }}>
              {isFavourite ? '♥ Favourite' : '♡ Favourite'}
            </button>
            <button
              onClick={handleRecommend}
              disabled={recSubmitting}
              style={{
                padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', border: '1.5px solid',
                borderColor: isRecommended ? '#0F6E56' : '#D4C9BA',
                background: isRecommended ? '#E8FDF6' : 'transparent',
                color: isRecommended ? '#0F6E56' : '#6B6660',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'all 0.15s',
              }}
            >
              {isRecommended ? '✓ Recommended' : '↑ Recommend'}
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
          <div style={{ borderTop: '1px solid #E4DDD4', paddingTop: 28, marginBottom: 28 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9390' }}>Cast &amp; Crew</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CREDIT_ROLE_ORDER.filter(role => byRole[role]).map(role => (
                <div key={role} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 12, color: '#9A9390', fontWeight: 500, minWidth: 76, paddingTop: 1, flexShrink: 0 }}>
                    {CREDIT_ROLE_LABELS[role]}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 0', alignItems: 'center' }}>
                    {byRole[role].map((c, i) => (
                      <React.Fragment key={c.people.id + role}>
                        <button
                          onClick={() => navigate('person', c.people.id)}
                          style={{
                            background: 'none', border: 'none', padding: '0 2px',
                            fontSize: 13, fontWeight: 500, color: '#1C1C1A',
                            cursor: 'pointer', textDecoration: 'underline',
                            textDecorationColor: '#D4C9BA', textUnderlineOffset: 2,
                            fontFamily: 'DM Sans, sans-serif',
                          }}
                        >
                          {c.people.name}
                        </button>
                        {c.character_name && (
                          <span style={{ fontSize: 12, color: '#9A9390' }}>&nbsp;as {c.character_name}</span>
                        )}
                        {i < byRole[role].length - 1 && (
                          <span style={{ color: '#D4C9BA', fontSize: 12, marginRight: 4 }}>,</span>
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

      {/* Seasons & Episodes — only for TV shows with season data */}
      {isTv && seasons.length > 0 && (
        <div style={{ borderTop: '1px solid #E4DDD4', paddingTop: 28, marginBottom: 28 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9390' }}>
            Seasons &amp; Episodes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {seasons.map(season => (
              <div key={season.id} style={{ border: '1px solid #E4DDD4', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
                {/* Season header — clickable to expand/collapse */}
                <button
                  onClick={() => toggleSeason(season.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1A' }}>
                      {season.title || `Season ${season.season_num}`}
                    </span>
                    {season.episodes && (
                      <span style={{ fontSize: 11, color: '#9A9390', fontWeight: 500 }}>
                        {season.episodes.length} episode{season.episodes.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: '#B5622A', fontWeight: 600, transition: 'transform 0.2s', display: 'inline-block', transform: openSeasons[season.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▾
                  </span>
                </button>

                {/* Episode list */}
                {openSeasons[season.id] && season.episodes && season.episodes.length > 0 && (
                  <div style={{ borderTop: '1px solid #F0EBE4' }}>
                    {season.episodes.map((ep, idx) => (
                      <div key={ep.id} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 14, padding: '11px 16px',
                        borderBottom: idx < season.episodes.length - 1 ? '1px solid #F0EBE4' : 'none',
                      }}>
                        <span style={{ fontSize: 12, color: '#C4BAB0', fontWeight: 600, minWidth: 24, flexShrink: 0, paddingTop: 1 }}>
                          {ep.episode_num}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1C1A', marginBottom: ep.description ? 3 : 0 }}>
                            {ep.title || `Episode ${ep.episode_num}`}
                          </div>
                          {ep.description && (
                            <div style={{ fontSize: 12, color: '#9A9390', lineHeight: 1.5 }}>{ep.description}</div>
                          )}
                        </div>
                        {ep.runtime_minutes && (
                          <span style={{ fontSize: 11, color: '#C4BAB0', flexShrink: 0, paddingTop: 2 }}>
                            {ep.runtime_minutes}m
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {openSeasons[season.id] && (!season.episodes || season.episodes.length === 0) && (
                  <div style={{ padding: '12px 16px', borderTop: '1px solid #F0EBE4', fontSize: 13, color: '#C4BAB0' }}>
                    No episodes added yet.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review section */}
      <div style={{ borderTop: '1px solid #E4DDD4', paddingTop: 28 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 20, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9390' }}>
          Reviews <span style={{ color: '#C4BAB0' }}>({reviews.length})</span>
        </h2>

        {/* Write / Edit review */}
        {(!userReview || editingReview) && (
          <div style={{ background: '#fff', border: '1px solid #E4DDD4', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, color: '#9A9390', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {userReview ? 'Edit your review' : 'Rate & review'}
            </p>
            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 20, padding: 2,
                    color: n <= displayRating ? '#B5622A' : '#E4DDD4',
                    transition: 'color 0.1s',
                  }}
                >★</button>
              ))}
              {rating > 0 && <span style={{ fontSize: 13, color: '#9A9390', marginLeft: 6, alignSelf: 'center' }}>{rating}/10</span>}
            </div>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Write a review (optional)…"
              rows={3}
              style={{
                width: '100%', border: '1px solid #E4DDD4', borderRadius: 8,
                padding: '10px 12px', fontSize: 13, resize: 'vertical',
                outline: 'none', background: '#F8F6F2', marginBottom: 10,
                boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif', color: '#1C1C1A',
              }}
            />
            {reviewError && <p style={{ fontSize: 12, color: '#c0392b', marginBottom: 8 }}>{reviewError}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSubmitReview} disabled={submitting} style={{
                background: '#1C1C1A', color: '#F8F6F2', border: 'none',
                borderRadius: 100, padding: '8px 18px', fontSize: 12, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontWeight: 500, letterSpacing: '0.02em',
              }}>
                {submitting ? 'Saving…' : userReview ? 'Update review' : 'Submit review'}
              </button>
              {editingReview && (
                <button onClick={() => setEditingReview(false)} style={{
                  background: 'transparent', border: '1px solid #E4DDD4', borderRadius: 100,
                  padding: '8px 16px', fontSize: 12, cursor: 'pointer', color: '#6B6660',
                  fontFamily: 'DM Sans, sans-serif',
                }}>Cancel</button>
              )}
            </div>
          </div>
        )}

        {/* User's existing review */}
        {userReview && !editingReview && (
          <div style={{ background: '#fff', border: '1px solid #E4DDD4', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1C1C1A' }}>Your review</span>
                <StarRating value={userReview.rating} />
                {userReview.recommendation && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                    background: userReview.recommendation === 'yes' ? '#EAF3DE' : '#FCEBEB',
                    color: userReview.recommendation === 'yes' ? '#3B6D11' : '#A32D2D',
                  }}>
                    {userReview.recommendation === 'yes' ? '↑ Recommended' : '↓ Not recommended'}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditingReview(true)} style={s.smallBtn}>Edit</button>
                <button onClick={handleDeleteReview} style={{ ...s.smallBtn, color: '#c0392b' }}>Delete</button>
              </div>
            </div>
            {userReview.content && <p style={{ fontSize: 13, color: '#4A4440', lineHeight: 1.6 }}>{userReview.content}</p>}
          </div>
        )}

        {/* All reviews */}
        {reviews.filter(r => r.user_id !== session.user.id).map(r => (
          <div key={r.id} style={{ borderBottom: '1px solid #F0EBE4', paddingBottom: 18, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: '#1C1C1A',
                color: '#F8F6F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, flexShrink: 0,
              }}>
                {(r.profiles?.username || '?')[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1C1A' }}>{r.profiles?.username || 'Unknown'}</span>
              <StarRating value={r.rating} />
              {r.recommendation && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                  background: r.recommendation === 'yes' ? '#EAF3DE' : '#FCEBEB',
                  color: r.recommendation === 'yes' ? '#3B6D11' : '#A32D2D',
                }}>
                  {r.recommendation === 'yes' ? '↑ Recommended' : '↓ Not recommended'}
                </span>
              )}
              <span style={{ fontSize: 11, color: '#C4BAB0', marginLeft: 'auto' }}>
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>
            {r.content && <p style={{ fontSize: 13, color: '#4A4440', lineHeight: 1.6, paddingLeft: 38 }}>{r.content}</p>}
          </div>
        ))}

        {reviews.length === 0 && (
          <p style={{ color: '#C4BAB0', fontSize: 13 }}>No reviews yet. Be the first!</p>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#9A9390', marginBottom: 3, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#1C1C1A' }}>{value}</div>
    </div>
  )
}

function StarRating({ value }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 12 }}>
      <span style={{ color: '#B5622A' }}>★</span>
      <span style={{ fontWeight: 600, color: '#1C1C1A' }}>{value}</span>
      <span style={{ color: '#9A9390' }}>/10</span>
    </span>
  )
}

const s = {
  smallBtn: {
    background: 'none', border: '1px solid #E4DDD4', borderRadius: 100,
    padding: '4px 12px', fontSize: 11, cursor: 'pointer', color: '#6B6660',
    fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
  },
}
