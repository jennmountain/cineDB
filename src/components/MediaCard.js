import React from 'react'
import supabase from '../config/supabaseClient'

function getPosterUrl(posterUrl) {
  if (!posterUrl) return null
  if (posterUrl.startsWith('http')) return posterUrl
  const { data } = supabase.storage.from('posters').getPublicUrl(posterUrl)
  return data.publicUrl
}

const cardStyles = `
  .media-card {
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #EDE9E3;
    cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
    position: relative;
    width: 100%;
  }

  .media-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(28, 28, 26, 0.1);
  }

  .media-card-poster {
    height: 360px;
    background: #EDE9E3;
    position: relative;
    overflow: hidden;
  }

  .media-card-poster img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }

  .media-card:hover .media-card-poster img {
    transform: scale(1.02);
  }

  .media-card-no-poster {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #C4BAB0;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
  }

  .media-card-type-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 9px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 100px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-family: 'DM Sans', sans-serif;
  }

  .media-card-type-badge.movie {
    background: rgba(181, 98, 42, 0.9);
    color: #fff;
  }

  .media-card-type-badge.tv {
    background: rgba(28, 28, 26, 0.75);
    color: #F8F6F2;
  }

  .media-card-mpa {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 9px;
    font-weight: 700;
    padding: 3px 7px;
    border-radius: 4px;
    background: rgba(0,0,0,0.5);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.04em;
  }

  .media-card-body {
    padding: 12px 13px 13px;
  }

  .media-card-title {
    font-family: 'DM Serif Display', serif;
    font-size: 14px;
    color: #1C1C1A;
    margin-bottom: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.3;
  }

  .media-card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3px;
  }

  .media-card-year-genre {
    font-size: 11px;
    color: #9A9390;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    margin-right: 8px;
  }

  .media-card-rating {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 12px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    color: #1C1C1A;
    flex-shrink: 0;
  }

  .media-card-star {
    color: #B5622A;
    font-size: 10px;
  }

  .media-card-imdb {
    font-size: 10px;
    color: #9A9390;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    gap: 3px;
    margin-top: 2px;
  }
`

export default function MediaCard({ media, onClick }) {
  const posterUrl = getPosterUrl(media.poster_url)

  return (
    <>
      <style>{cardStyles}</style>
      <div className="media-card" onClick={onClick}>
        <div className="media-card-poster">
          {posterUrl
            ? <img src={posterUrl} alt={media.title} />
            : <div className="media-card-no-poster">No poster</div>
          }
          <span className={`media-card-type-badge ${media.type}`}>
            {media.type === 'movie' ? 'Film' : 'TV'}
          </span>
          {media.mpa_rating && (
            <span className="media-card-mpa">{media.mpa_rating}</span>
          )}
        </div>

        <div className="media-card-body">
          <div className="media-card-title">{media.title}</div>
          <div className="media-card-meta">
            <span className="media-card-year-genre">
              {media.release_year || '—'}{media.genre ? ` · ${media.genre}` : ''}
            </span>
            {media.avg_rating > 0 && (
              <span className="media-card-rating">
                <span className="media-card-star">★</span>
                {media.avg_rating}
              </span>
            )}
          </div>
          {media.imdb_rating && (
            <div className="media-card-imdb">
              <span>🍅</span>
              <span>RT {media.imdb_rating}%</span>
              </div>
            )}
        </div>
      </div>
    </>
  )
}
