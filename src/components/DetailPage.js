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

const dpStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .dp-root {
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 24px;
    font-family: 'DM Sans', sans-serif;
    background: #F8F6F2;
    min-height: 100vh;
  }

  .dp-back {
    background: none; border: none; color: #9A9390; font-size: 12px;
    cursor: pointer; margin-bottom: 24px; padding: 0;
    font-family: 'DM Sans', sans-serif; letter-spacing: 0.04em;
    text-transform: uppercase; font-weight: 500;
    display: block;
  }

  .dp-back:hover { color: #B5622A; }

  .dp-hero {
    display: flex; gap: 32px; margin-bottom: 40px; flex-wrap: wrap;
  }

  .dp-poster {
    width: 200px; border-radius: 12px; overflow: hidden; flex-shrink: 0;
    background: #EDE9E3; border: 1px solid #E4DDD4; aspect-ratio: 2/3;
  }

  .dp-poster img { width: 100%; height: 100%; object-fit: contain; display: block; }

  .dp-poster-empty {
    width: 100%; height: 100%; display: flex; align-items: center;
    justify-content: center; color: #C4BAB0; font-size: 13px;
  }

  .dp-info { flex: 1; min-width: 220px; }

  .dp-badges {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 10px; flex-wrap: wrap;
  }

  .dp-type-badge {
    background: #1C1C1A; color: #F8F6F2;
    font-size: 9px; font-weight: 600; padding: 3px 10px; border-radius: 100px;
    letter-spacing: 0.1em; text-transform: uppercase;
  }

  .dp-mpa-badge {
    border: 1.5px solid #D4C9BA; color: #6B6660;
    font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 6px;
  }

  .dp-genre { font-size: 12px; color: #9A9390; }

  .dp-title {
    font-size: 28px; font-weight: 400; margin-bottom: 16px; line-height: 1.2;
    font-family: 'DM Serif Display', serif; color: #1C1C1A;
  }

  .dp-stats { display: flex; gap: 20px; margin-bottom: 18px; flex-wrap: wrap; }

  .dp-stat-label {
    font-size: 11px; color: #9A9390; margin-bottom: 3px;
    font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase;
  }

  .dp-stat-value { font-size: 14px; font-weight: 500; color: #1C1C1A; }

  .dp-overview { font-size: 14px; color: #4A4440; line-height: 1.7; margin-bottom: 22px; }

  .dp-actions { display: flex; gap: 8px; flex-wrap: wrap; }

  .dp-action-btn {
    padding: 7px 14px; border-radius: 100px; font-size: 12px; font-weight: 500;
    cursor: pointer; border: 1.5px solid #D4C9BA; background: transparent;
    color: #6B6660; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
  }

  .dp-action-btn.active-watch {
    background: #1C1C1A; border-color: #1C1C1A; color: #F8F6F2;
  }

  .dp-action-btn.active-fav {
    background: #FDF0E8; border-color: #B5622A; color: #B5622A;
  }

  .dp-action-btn.active-rec {
    background: #E8FDF6; border-color: #0F6E56; color: #0F6E56;
  }

  .dp-section {
    border-top: 1px solid #E4DDD4; padding-top: 28px; margin-bottom: 28px;
  }

  .dp-section-title {
    font-size: 13px; font-weight: 600; margin-bottom: 16px;
    letter-spacing: 0.08em; text-transform: uppercase; color: #9A9390;
  }

  /* Credits */
  .dp-credit-row { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px; }

  .dp-credit-role {
    font-size: 12px; color: #9A9390; font-weight: 500;
    min-width: 76px; padding-top: 1px; flex-shrink: 0;
  }

  .dp-credit-people { display: flex; flex-wrap: wrap; gap: 2px 0; align-items: center; }

  .dp-person-btn {
    background: none; border: none; padding: 0 2px; font-size: 13px;
    font-weight: 500; color: #1C1C1A; cursor: pointer;
    text-decoration: underline; text-decoration-color: #D4C9BA;
    text-underline-offset: 2px; font-family: 'DM Sans', sans-serif;
    transition: color 0.15s;
  }

  .dp-person-btn:hover { color: #B5622A; }

  .dp-character { font-size: 12px; color: #9A9390; }

  /* Seasons */
  .dp-season-card {
    border: 1px solid #E4DDD4; border-radius: 10px;
    overflow: hidden; margin-bottom: 8px; background: #fff;
  }

  .dp-season-header {
    width: 100%; display: flex; align-items: center;
    justify-content: space-between; padding: 13px 16px;
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; text-align: left;
  }

  .dp-season-title { font-size: 14px; font-weight: 600; color: #1C1C1A; }
  .dp-season-count { font-size: 11px; color: #9A9390; font-weight: 500; }
  .dp-season-arrow { font-size: 12px; color: #B5622A; font-weight: 600; transition: transform 0.2s; }

  .dp-episode-list { border-top: 1px solid #F0EBE4; }

  .dp-episode-row {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 11px 16px; border-bottom: 1px solid #F0EBE4;
  }

  .dp-episode-row:last-child { border-bottom: none; }

  .dp-ep-num { font-size: 12px; color: #C4BAB0; font-weight: 600; min-width: 24px; flex-shrink: 0; padding-top: 1px; }
  .dp-ep-info { flex: 1; min-width: 0; }
  .dp-ep-title { font-size: 13px; font-weight: 500; color: #1C1C1A; }
  .dp-ep-desc { font-size: 12px; color: #9A9390; line-height: 1.5; margin-top: 2px; }
  .dp-ep-runtime { font-size: 11px; color: #C4BAB0; flex-shrink: 0; padding-top: 2px; }

  .dp-no-episodes { padding: 12px 16px; border-top: 1px solid #F0EBE4; font-size: 13px; color: #C4BAB0; }

  /* Reviews */
  .dp-review-form {
    background: #fff; border: 1px solid #E4DDD4;
    border-radius: 12px; padding: 20px; margin-bottom: 24px;
  }

  .dp-review-form-label {
    font-size: 12px; font-weight: 600; margin-bottom: 12px;
    color: #9A9390; letter-spacing: 0.06em; text-transform: uppercase;
  }

  .dp-stars { display: flex; gap: 4px; margin-bottom: 14px; }

  .dp-star-btn {
    background: none; border: none; cursor: pointer;
    font-size: 20px; padding: 2px; transition: color 0.1s;
  }

  .dp-star-count { font-size: 13px; color: #9A9390; margin-left: 6px; align-self: center; }

  .dp-review-textarea {
    width: 100%; border: 1px solid #E4DDD4; border-radius: 8px;
    padding: 10px 12px; font-size: 13px; resize: vertical;
    outline: none; background: #F8F6F2; margin-bottom: 10px;
    box-sizing: border-box; font-family: 'DM Sans', sans-serif; color: #1C1C1A;
    transition: border-color 0.15s;
  }

  .dp-review-textarea:focus { border-color: #B5622A; }

  .dp-submit-btn {
    background: #1C1C1A; color: #F8F6F2; border: none;
    border-radius: 100px; padding: 8px 18px; font-size: 12px;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    font-weight: 500; letter-spacing: 0.02em; transition: background 0.15s;
  }

  .dp-submit-btn:hover { background: #B5622A; }

  .dp-cancel-btn {
    background: transparent; border: 1px solid #E4DDD4; border-radius: 100px;
    padding: 8px 16px; font-size: 12px; cursor: pointer; color: #6B6660;
    font-family: 'DM Sans', sans-serif; margin-left: 8px;
  }

  .dp-your-review {
    background: #fff; border: 1px solid #E4DDD4;
    border-radius: 12px; padding: 16px; margin-bottom: 24px;
  }

  .dp-your-review-top {
    display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 8px;
  }

  .dp-review-label { font-size: 12px; font-weight: 600; color: #1C1C1A; }

  .dp-small-btn {
    background: none; border: 1px solid #E4DDD4; border-radius: 100px;
    padding: 4px 12px; font-size: 11px; cursor: pointer; color: #6B6660;
    font-family: 'DM Sans', sans-serif; font-weight: 500;
  }

  .dp-review-item { border-bottom: 1px solid #F0EBE4; padding-bottom: 18px; margin-bottom: 18px; }
  .dp-review-item:last-child { border-bottom: none; }

  .dp-review-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }

  .dp-reviewer-avatar {
    width: 28px; height: 28px; border-radius: 50%; background: #1C1C1A;
    color: #F8F6F2; display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600; flex-shrink: 0;
  }

  .dp-reviewer-name { font-size: 13px; font-weight: 500; color: #1C1C1A; }
  .dp-review-date { font-size: 11px; color: #C4BAB0; margin-left: auto; }
  .dp-review-content { font-size: 13px; color: #4A4440; line-height: 1.6; padding-left: 38px; }

  .dp-rec-badge {
    font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 100px;
  }

  .dp-error-msg { font-size: 12px; color: #c0392b; margin-bottom: 8px; }
  .dp-no-reviews { color: #C4BAB0; font-size: 13px; }

  /* Similar titles */
  .dp-similar-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  }

  @media (max-width: 600px) { .dp-similar-grid { grid-template-columns: repeat(2, 1fr); } }

  .dp-similar-card {
    background: #fff; border-radius: 10px; border: 1px solid #EDE9E3;
    overflow: hidden; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
  }

  .dp-similar-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(28,28,26,0.08);
  }

  .dp-similar-poster {
    height: 180px; background: #EDE9E3; position: relative; overflow: hidden;
  }

  .dp-similar-poster img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .dp-similar-poster-empty {
    width: 100%; height: 100%; display: flex; align-items: center;
    justify-content: center; color: #C4BAB0; font-size: 12px;
  }

  .dp-similar-body { padding: 11px 13px 13px; }

  .dp-similar-title {
    font-family: 'DM Serif Display', serif; font-size: 14px; color: #1C1C1A;
    margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .dp-similar-meta {
    display: flex; justify-content: space-between; align-items: center;
  }

  .dp-similar-year { font-size: 11px; color: #9A9390; }
  .dp-similar-rating { font-size: 12px; font-weight: 600; color: #1C1C1A; display: flex; align-items: center; gap: 2px; }
  .dp-similar-rt { font-size: 10px; color: #9A9390; margin-top: 2px; display: flex; align-items: center; gap: 2px; }

  /* Dark mode overrides */
  body.dark-mode .dp-root { background: #141414 !important; }
  body.dark-mode .dp-back { color: #666 !important; }
  body.dark-mode .dp-back:hover { color: #C8713A !important; }
  body.dark-mode .dp-title { color: #F0EDE8 !important; }
  body.dark-mode .dp-type-badge { background: #2A2A2A !important; color: #C0BAB4 !important; }
  body.dark-mode .dp-mpa-badge { border-color: #3A3A3A !important; color: #666 !important; }
  body.dark-mode .dp-genre { color: #666 !important; }
  body.dark-mode .dp-stat-label { color: #555 !important; }
  body.dark-mode .dp-stat-value { color: #F0EDE8 !important; }
  body.dark-mode .dp-overview { color: #9A9390 !important; }
  body.dark-mode .dp-action-btn { border-color: #3A3A3A !important; color: #888 !important; }
  body.dark-mode .dp-action-btn.active-watch { background: #F0EDE8 !important; border-color: #F0EDE8 !important; color: #141414 !important; }
  body.dark-mode .dp-section { border-top-color: #2A2A2A !important; }
  body.dark-mode .dp-section-title { color: #555 !important; }
  body.dark-mode .dp-credit-role { color: #555 !important; }
  body.dark-mode .dp-person-btn { color: #C8713A !important; text-decoration-color: #3A3A3A !important; }
  body.dark-mode .dp-character { color: #555 !important; }
  body.dark-mode .dp-season-card { background: #1E1E1E !important; border-color: #2A2A2A !important; }
  body.dark-mode .dp-season-header { background: transparent !important; }
  body.dark-mode .dp-season-title { color: #F0EDE8 !important; }
  body.dark-mode .dp-season-count { color: #555 !important; }
  body.dark-mode .dp-episode-list { border-top-color: #2A2A2A !important; }
  body.dark-mode .dp-episode-row { border-bottom-color: #2A2A2A !important; }
  body.dark-mode .dp-ep-title { color: #C0BAB4 !important; }
  body.dark-mode .dp-ep-desc { color: #555 !important; }
  body.dark-mode .dp-ep-num { color: #3A3A3A !important; }
  body.dark-mode .dp-review-form { background: #1E1E1E !important; border-color: #2A2A2A !important; }
  body.dark-mode .dp-review-form-label { color: #555 !important; }
  body.dark-mode .dp-review-textarea { background: #2A2A2A !important; border-color: #3A3A3A !important; color: #F0EDE8 !important; }
  body.dark-mode .dp-your-review { background: #1E1E1E !important; border-color: #2A2A2A !important; }
  body.dark-mode .dp-review-label { color: #F0EDE8 !important; }
  body.dark-mode .dp-review-item { border-bottom-color: #2A2A2A !important; }
  body.dark-mode .dp-reviewer-avatar { background: #2A2A2A !important; color: #C0BAB4 !important; }
  body.dark-mode .dp-reviewer-name { color: #C0BAB4 !important; }
  body.dark-mode .dp-review-content { color: #9A9390 !important; }
  body.dark-mode .dp-review-date { color: #3A3A3A !important; }
  body.dark-mode .dp-poster { background: #2A2A2A !important; border-color: #3A3A3A !important; }
  body.dark-mode .dp-similar-card { background: #1E1E1E !important; border-color: #2A2A2A !important; }
  body.dark-mode .dp-similar-title { color: #F0EDE8 !important; }
  body.dark-mode .dp-similar-year { color: #555 !important; }
  body.dark-mode .dp-similar-rating { color: #F0EDE8 !important; }
  body.dark-mode .dp-similar-rt { color: #555 !important; }
  body.dark-mode .dp-similar-poster { background: #2A2A2A !important; }
  body.dark-mode .dp-no-reviews { color: #3A3A3A !important; }
  body.dark-mode .dp-small-btn { border-color: #3A3A3A !important; color: #888 !important; }
`

export default function DetailPage({ mediaId, navigate, session, profile }) {
  const [media,         setMedia]         = useState(null)
  const [credits,       setCredits]       = useState([])
  const [reviews,       setReviews]       = useState([])
  const [seasons,       setSeasons]       = useState([])
  const [watchStatus,   setWatchStatus]   = useState(null)
  const [isFavourite,   setIsFavourite]   = useState(false)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [openSeasons,   setOpenSeasons]   = useState({})
  const [rating,        setRating]        = useState(0)
  const [hoverRating,   setHoverRating]   = useState(0)
  const [reviewText,    setReviewText]    = useState('')
  const [submitting,    setSubmitting]    = useState(false)
  const [reviewError,   setReviewError]   = useState(null)
  const [userReview,    setUserReview]    = useState(null)
  const [editingReview, setEditingReview] = useState(false)
  const [isRecommended, setIsRecommended] = useState(false)
  const [recSubmitting, setRecSubmitting] = useState(false)
  const [similar,       setSimilar]       = useState([])

  useEffect(() => { if (mediaId) load() }, [mediaId])

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
      if (m?.genre) fetchSimilar(m.genre, mediaId)
      setCredits(c || [])
      setReviews(r || [])
      setSeasons(s || [])
      setWatchStatus(w?.watch_status || null)
      setIsFavourite(w?.is_favourite || false)
      setIsRecommended(!!rec)
      const myReview = (r || []).find(rv => rv.user_id === session.user.id)
      if (myReview) { setUserReview(myReview); setRating(myReview.rating); setReviewText(myReview.content || '') }
      if (s && s.length > 0) setOpenSeasons({ [s[0].id]: true })
    }
    setLoading(false)
  }

  async function fetchSimilar(genre, currentId) {
    const { data } = await supabase.from('media').select('id, title, type, release_year, genre, avg_rating, poster_url, imdb_rating, mpa_rating').eq('genre', genre).neq('id', currentId).order('avg_rating', { ascending: false }).limit(6)
    setSimilar(data || [])
  }

  function toggleSeason(id) { setOpenSeasons(prev => ({ ...prev, [id]: !prev[id] })) }

  async function handleWatchStatus(status) {
    const next = watchStatus === status ? null : status
    if (next === null && !isFavourite) await supabase.from('watchlist').delete().eq('media_id', mediaId).eq('user_id', session.user.id)
    else await supabase.from('watchlist').upsert({ user_id: session.user.id, media_id: mediaId, watch_status: next, is_favourite: isFavourite }, { onConflict: 'user_id,media_id' })
    setWatchStatus(next)
  }

  async function handleFavourite() {
    const next = !isFavourite
    if (!next && watchStatus === null) await supabase.from('watchlist').delete().eq('media_id', mediaId).eq('user_id', session.user.id)
    else await supabase.from('watchlist').upsert({ user_id: session.user.id, media_id: mediaId, watch_status: watchStatus, is_favourite: next }, { onConflict: 'user_id,media_id' })
    setIsFavourite(next)
  }

  async function handleRecommend() {
    setRecSubmitting(true)
    if (isRecommended) { await supabase.from('recommendations').delete().eq('media_id', mediaId).eq('user_id', session.user.id); setIsRecommended(false) }
    else { await supabase.from('recommendations').insert({ media_id: mediaId, user_id: session.user.id }); setIsRecommended(true) }
    setRecSubmitting(false)
  }

  async function handleSubmitReview() {
    if (!rating) { setReviewError('Please select a rating.'); return }
    setSubmitting(true); setReviewError(null)
    const payload = { user_id: session.user.id, media_id: mediaId, rating, content: reviewText.trim() || null }
    const { error } = userReview && !editingReview ? { error: null } : await supabase.from('reviews').upsert(payload, { onConflict: 'user_id,media_id' })
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

  const posterUrl    = getPosterUrl(media.poster_url)
  const displayRating = hoverRating || rating
  const isTv         = media.type === 'tv'
  const yearRange    = media.release_year
    ? isTv && media.end_year   ? `${media.release_year}–${media.end_year}`
    : isTv && !media.end_year  ? `${media.release_year}–present`
    : `${media.release_year}` : null

  const byRole = {}
  for (const c of credits) { if (!byRole[c.role]) byRole[c.role] = []; byRole[c.role].push(c) }

  return (
    <>
      <style>{dpStyles}</style>
      <div className="dp-root">

        <button className="dp-back" onClick={() => navigate('browse')}>← Back to browse</button>

        {/* Hero */}
        <div className="dp-hero">
          <div className="dp-poster">
            {posterUrl ? <img src={posterUrl} alt={media.title} /> : <div className="dp-poster-empty">No poster</div>}
          </div>
          <div className="dp-info">
            <div className="dp-badges">
              <span className="dp-type-badge">{isTv ? 'TV Series' : 'Film'}</span>
              {media.mpa_rating && <span className="dp-mpa-badge">{media.mpa_rating}</span>}
              {media.genre && <span className="dp-genre">{media.genre}</span>}
            </div>
            <h1 className="dp-title">{media.title}</h1>
            <div className="dp-stats">
              {yearRange && <div><div className="dp-stat-label">Year</div><div className="dp-stat-value">{yearRange}</div></div>}
              {media.runtime_minutes && <div><div className="dp-stat-label">{isTv ? 'Ep. Runtime' : 'Runtime'}</div><div className="dp-stat-value">{media.runtime_minutes} min</div></div>}
              {isTv && media.seasons  && <div><div className="dp-stat-label">Seasons</div><div className="dp-stat-value">{media.seasons}</div></div>}
              {isTv && media.episodes && <div><div className="dp-stat-label">Episodes</div><div className="dp-stat-value">{media.episodes}</div></div>}
              {media.imdb_rating && <div><div className="dp-stat-label">RT Score</div><div className="dp-stat-value"><span>🍅</span> <strong>{media.imdb_rating}%</strong></div></div>}
              {media.avg_rating > 0 && <div><div className="dp-stat-label">User Rating</div><div className="dp-stat-value"><span style={{color:'#B5622A'}}>★</span> <strong>{media.avg_rating}</strong> <span style={{color:'#9A9390',fontWeight:400}}>/10</span></div></div>}
            </div>
            {media.overview && <p className="dp-overview">{media.overview}</p>}
            <div className="dp-actions">
              {WATCH_STATUSES.map(({ value, label }) => (
                <button key={value} onClick={() => handleWatchStatus(value)}
                  className={`dp-action-btn${watchStatus === value ? ' active-watch' : ''}`}>{label}</button>
              ))}
              <button onClick={handleFavourite}
                className={`dp-action-btn${isFavourite ? ' active-fav' : ''}`}>
                {isFavourite ? '♥ Favourite' : '♡ Favourite'}
              </button>
              <button onClick={handleRecommend} disabled={recSubmitting}
                className={`dp-action-btn${isRecommended ? ' active-rec' : ''}`}>
                {isRecommended ? '✓ Recommended' : '↑ Recommend'}
              </button>
            </div>
          </div>
        </div>

        {/* Cast & Crew */}
        {credits.length > 0 && (
          <div className="dp-section">
            <div className="dp-section-title">Cast &amp; Crew</div>
            {CREDIT_ROLE_ORDER.filter(role => byRole[role]).map(role => (
              <div key={role} className="dp-credit-row">
                <span className="dp-credit-role">{CREDIT_ROLE_LABELS[role]}</span>
                <div className="dp-credit-people">
                  {byRole[role].map((c, i) => (
                    <React.Fragment key={c.people.id + role}>
                      <button className="dp-person-btn" onClick={() => navigate('person', c.people.id)}>{c.people.name}</button>
                      {c.character_name && <span className="dp-character">&nbsp;as {c.character_name}</span>}
                      {i < byRole[role].length - 1 && <span style={{color:'#D4C9BA',fontSize:12,marginRight:4}}>,</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Seasons & Episodes */}
        {isTv && seasons.length > 0 && (
          <div className="dp-section">
            <div className="dp-section-title">Seasons &amp; Episodes</div>
            {seasons.map(season => (
              <div key={season.id} className="dp-season-card">
                <button className="dp-season-header" onClick={() => toggleSeason(season.id)}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <span className="dp-season-title">{season.title || `Season ${season.season_num}`}</span>
                    {season.episodes && <span className="dp-season-count">{season.episodes.length} episode{season.episodes.length !== 1 ? 's' : ''}</span>}
                  </div>
                  <span className="dp-season-arrow" style={{transform: openSeasons[season.id] ? 'rotate(180deg)' : 'rotate(0)'}}>▾</span>
                </button>
                {openSeasons[season.id] && season.episodes?.length > 0 && (
                  <div className="dp-episode-list">
                    {season.episodes.map(ep => (
                      <div key={ep.id} className="dp-episode-row">
                        <span className="dp-ep-num">{ep.episode_num}</span>
                        <div className="dp-ep-info">
                          <div className="dp-ep-title">{ep.title || `Episode ${ep.episode_num}`}</div>
                          {ep.description && <div className="dp-ep-desc">{ep.description}</div>}
                        </div>
                        {ep.runtime_minutes && <span className="dp-ep-runtime">{ep.runtime_minutes}m</span>}
                      </div>
                    ))}
                  </div>
                )}
                {openSeasons[season.id] && (!season.episodes || season.episodes.length === 0) && (
                  <div className="dp-no-episodes">No episodes added yet.</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reviews */}
        <div className="dp-section">
          <div className="dp-section-title">Reviews <span style={{color:'#C4BAB0'}}>({reviews.length})</span></div>

          {(!userReview || editingReview) && (
            <div className="dp-review-form">
              <div className="dp-review-form-label">{userReview ? 'Edit your review' : 'Rate & review'}</div>
              <div className="dp-stars">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} className="dp-star-btn"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{color: n <= displayRating ? '#B5622A' : '#E4DDD4'}}>★</button>
                ))}
                {rating > 0 && <span className="dp-star-count">{rating}/10</span>}
              </div>
              <textarea className="dp-review-textarea" value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Write a review (optional)…" rows={3} />
              {reviewError && <div className="dp-error-msg">{reviewError}</div>}
              <div style={{display:'flex',gap:8}}>
                <button className="dp-submit-btn" onClick={handleSubmitReview} disabled={submitting}>
                  {submitting ? 'Saving…' : userReview ? 'Update review' : 'Submit review'}
                </button>
                {editingReview && <button className="dp-cancel-btn" onClick={() => setEditingReview(false)}>Cancel</button>}
              </div>
            </div>
          )}

          {userReview && !editingReview && (
            <div className="dp-your-review">
              <div className="dp-your-review-top">
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span className="dp-review-label">Your review</span>
                  <StarRating value={userReview.rating} />
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button className="dp-small-btn" onClick={() => setEditingReview(true)}>Edit</button>
                  <button className="dp-small-btn" style={{color:'#c0392b'}} onClick={handleDeleteReview}>Delete</button>
                </div>
              </div>
              {userReview.content && <p style={{fontSize:13,color:'#4A4440',lineHeight:1.6}}>{userReview.content}</p>}
            </div>
          )}

          {reviews.filter(r => r.user_id !== session.user.id).map(r => (
            <div key={r.id} className="dp-review-item">
              <div className="dp-review-meta">
                <div className="dp-reviewer-avatar">{(r.profiles?.username || '?')[0].toUpperCase()}</div>
                <span className="dp-reviewer-name">{r.profiles?.username || 'Unknown'}</span>
                <StarRating value={r.rating} />
                <span className="dp-review-date">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.content && <p className="dp-review-content">{r.content}</p>}
            </div>
          ))}

          {reviews.length === 0 && <p className="dp-no-reviews">No reviews yet. Be the first!</p>}
        </div>

        {/* Similar titles */}
        {similar.length > 0 && (
          <div className="dp-section">
            <div className="dp-section-title">You Might Also Like</div>
            <div className="dp-similar-grid">
              {similar.map(item => (
                <div key={item.id} className="dp-similar-card" onClick={() => navigate('detail', item.id)}>
                  <div className="dp-similar-poster">
                    {getPosterUrl(item.poster_url)
                      ? <img src={getPosterUrl(item.poster_url)} alt={item.title} />
                      : <div className="dp-similar-poster-empty">No poster</div>}
                    <span style={{position:'absolute',top:8,left:8,background:item.type==='movie'?'rgba(181,98,42,0.9)':'rgba(28,28,26,0.75)',color:'#fff',fontSize:9,fontWeight:600,padding:'3px 8px',borderRadius:100,letterSpacing:'0.08em',textTransform:'uppercase'}}>
                      {item.type === 'movie' ? 'Film' : 'TV'}
                    </span>
                    {item.mpa_rating && <span style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,0.5)',color:'#fff',fontSize:9,fontWeight:700,padding:'3px 7px',borderRadius:4}}>{item.mpa_rating}</span>}
                  </div>
                  <div className="dp-similar-body">
                    <div className="dp-similar-title">{item.title}</div>
                    <div className="dp-similar-meta">
                      <span className="dp-similar-year">{item.release_year || '—'}{item.genre ? ` · ${item.genre}` : ''}</span>
                      {item.avg_rating > 0 && <span className="dp-similar-rating"><span style={{color:'#B5622A',fontSize:10}}>★</span>{item.avg_rating}</span>}
                    </div>
                    {item.imdb_rating && <div className="dp-similar-rt"><span>🍅</span><span>RT {item.imdb_rating}%</span></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}

function StarRating({ value }) {
  return (
    <span style={{display:'flex',alignItems:'center',gap:2,fontSize:12}}>
      <span style={{color:'#B5622A'}}>★</span>
      <span style={{fontWeight:600,color:'#1C1C1A'}}>{value}</span>
      <span style={{color:'#9A9390'}}>/10</span>
    </span>
  )
}
