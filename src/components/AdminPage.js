import React, { useState, useEffect, useRef } from 'react'
import supabase from '../config/supabaseClient'

const GENRES      = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Documentary', 'Animation', 'Crime']
const MPA_RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR']
const ROLES       = ['actor', 'director', 'producer', 'writer']
const ROLE_LABELS = { actor: 'Actor', director: 'Director', producer: 'Producer', writer: 'Writer' }
const ROLE_COLORS = {
  director: { bg: '#FEF3E2', color: '#92400E' },
  writer:   { bg: '#F0FDF4', color: '#166534' },
  producer: { bg: '#EFF6FF', color: '#1E40AF' },
  actor:    { bg: '#FAF5FF', color: '#6B21A8' },
}
const EMPTY_MEDIA_FORM  = { title: '', type: 'movie', genre: '', overview: '', release_year: '', end_year: '', runtime_minutes: '', mpa_rating: '', imdb_rating: '' }
const EMPTY_PERSON_FORM = { name: '', bio: '', born_year: '', died_year: '' }

function getPosterUrl(posterUrl) {
  if (!posterUrl) return null
  if (posterUrl.startsWith('http')) return posterUrl
  const { data } = supabase.storage.from('posters').getPublicUrl(posterUrl)
  return data.publicUrl
}

const adminStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .adm-root {
    height: calc(100vh - 54px);
    display: flex;
    flex-direction: column;
    font-family: 'DM Sans', sans-serif;
    background: #F8F6F2;
  }

  .adm-tabs {
    display: flex;
    background: #F8F6F2;
    border-bottom: 1px solid #E4DDD4;
    padding: 0 24px;
    flex-shrink: 0;
  }

  .adm-tab {
    padding: 14px 20px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #9A9390;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.04em;
    transition: all 0.15s;
  }

  .adm-tab.active {
    color: #1C1C1A;
    border-bottom-color: #B5622A;
    font-weight: 600;
  }

  .adm-body {
    flex: 1;
    overflow: hidden;
    display: flex;
  }

  /* Sidebar */
  .adm-sidebar {
    width: 300px;
    border-right: 1px solid #E4DDD4;
    display: flex;
    flex-direction: column;
    background: #fff;
    flex-shrink: 0;
    transition: width 0.2s;
  }

  .adm-sidebar.collapsed {
    width: 0;
    overflow: hidden;
  }

  .adm-sidebar-header {
    padding: 14px 16px;
    border-bottom: 1px solid #E4DDD4;
    display: flex;
    gap: 8px;
    align-items: center;
    flex-shrink: 0;
  }

  .adm-search {
    flex: 1;
    border: 1.5px solid #D4C9BA;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    color: #1C1C1A;
    background: #F8F6F2;
    transition: border-color 0.15s;
  }

  .adm-search:focus {
    border-color: #B5622A;
  }

  .adm-add-btn {
    background: #1C1C1A;
    color: #F8F6F2;
    border: none;
    border-radius: 8px;
    padding: '8px 14px';
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    white-space: nowrap;
    padding: 8px 14px;
    transition: background 0.15s;
  }

  .adm-add-btn:hover {
    background: #B5622A;
  }

  .adm-list {
    overflow-y: auto;
    flex: 1;
  }

  .adm-list-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-bottom: 1px solid #F5F0EB;
    cursor: pointer;
    transition: background 0.1s;
  }

  .adm-list-item:hover {
    background: #FBF9F6;
  }

  .adm-list-item.active {
    background: #FDF0E8;
    border-left: 3px solid #B5622A;
    padding-left: 13px;
  }

  .adm-list-thumb {
    width: 34px;
    height: 48px;
    border-radius: 5px;
    overflow: hidden;
    background: #EDE9E3;
    flex-shrink: 0;
  }

  .adm-list-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .adm-list-thumb-person {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    overflow: hidden;
    background: #EDE9E3;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }

  .adm-list-info {
    flex: 1;
    min-width: 0;
  }

  .adm-list-title {
    font-size: 13px;
    font-weight: 500;
    color: #1C1C1A;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .adm-list-meta {
    font-size: 11px;
    color: #9A9390;
    margin-top: 2px;
  }

  .adm-list-delete {
    background: none;
    border: none;
    color: #D4C9BA;
    cursor: pointer;
    font-size: 14px;
    padding: 4px;
    border-radius: 4px;
    flex-shrink: 0;
    transition: color 0.15s;
  }

  .adm-list-delete:hover {
    color: #c0392b;
  }

  /* Panel */
  .adm-panel {
    flex: 1;
    overflow-y: auto;
    padding: 28px 32px;
    background: #F8F6F2;
  }

  .adm-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .adm-panel-label {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #B5622A;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .adm-panel-title {
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
    color: #1C1C1A;
    font-weight: 400;
  }

  .adm-close-btn {
    background: #EDE9E3;
    border: none;
    border-radius: 8px;
    width: 32px;
    height: 32px;
    cursor: pointer;
    font-size: 14px;
    color: #6B6660;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s;
  }

  .adm-close-btn:hover {
    background: #D4C9BA;
  }

  .adm-form-card {
    background: #fff;
    border: 1px solid #E4DDD4;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
  }

  .adm-form-card-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9A9390;
    margin-bottom: 16px;
  }

  .adm-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .adm-field {
    margin-bottom: 0;
  }

  .adm-field label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #6B6660;
    margin-bottom: 5px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .adm-field input,
  .adm-field select,
  .adm-field textarea {
    width: 100%;
    border: 1.5px solid #D4C9BA;
    border-radius: 8px;
    padding: 9px 11px;
    font-size: 13px;
    outline: none;
    background: #F8F6F2;
    font-family: 'DM Sans', sans-serif;
    color: #1C1C1A;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }

  .adm-field input:focus,
  .adm-field select:focus,
  .adm-field textarea:focus {
    border-color: #B5622A;
    background: #fff;
  }

  .adm-field textarea {
    resize: vertical;
  }

  .adm-col-span-2 {
    grid-column: 1 / -1;
  }

  .adm-btn-row {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }

  .adm-save-btn {
    background: #1C1C1A;
    color: #F8F6F2;
    border: none;
    border-radius: 100px;
    padding: 10px 22px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.04em;
    transition: background 0.15s;
  }

  .adm-save-btn:hover:not(:disabled) {
    background: #B5622A;
  }

  .adm-save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .adm-delete-btn {
    background: transparent;
    color: #c0392b;
    border: 1.5px solid #FCCACA;
    border-radius: 100px;
    padding: 10px 18px;
    font-size: 12px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }

  .adm-delete-btn:hover {
    background: #FFF0F0;
  }

  .adm-error {
    background: #FDF0E8;
    border: 1px solid #E8C4A0;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #B5622A;
    margin-bottom: 14px;
  }

  .adm-success {
    background: #EAF3DE;
    border: 1px solid #B8D99A;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #3B6D11;
    margin-bottom: 14px;
  }

  /* Credits */
  .adm-credit-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    background: #F8F6F2;
    border: 1px solid #EDE9E3;
    margin-bottom: 6px;
  }

  .adm-role-badge {
    font-size: 9px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 100px;
    flex-shrink: 0;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* Suggestions dropdown */
  .adm-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 20;
    background: #fff;
    border: 1.5px solid #D4C9BA;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(28,28,26,0.1);
    overflow: hidden;
    margin-top: 2px;
  }

  .adm-suggestion-item {
    padding: 9px 12px;
    font-size: 13px;
    cursor: pointer;
    color: #1C1C1A;
    transition: background 0.1s;
  }

  .adm-suggestion-item:hover {
    background: #F8F6F2;
  }

  /* Seasons */
  .adm-season-card {
    border: 1px solid #E4DDD4;
    border-radius: 10px;
    margin-bottom: 8px;
    overflow: hidden;
    background: #fff;
  }

  .adm-season-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 14px;
    cursor: pointer;
    background: #F8F6F2;
    transition: background 0.1s;
  }

  .adm-season-header:hover {
    background: #F0EBE4;
  }

  .adm-ep-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid #F5F0EB;
  }

  .adm-ep-row:last-child {
    border-bottom: none;
  }

  /* Poster upload */
  .adm-poster-wrap {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }

  .adm-poster-preview {
    width: 72px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
    background: #EDE9E3;
    border: 1px solid #E4DDD4;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #C4BAB0;
    text-align: center;
  }

  .adm-poster-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .adm-upload-btn {
    border: 1.5px solid #D4C9BA;
    background: #fff;
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 12px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    color: #6B6660;
    font-weight: 500;
    transition: all 0.15s;
  }

  .adm-upload-btn:hover {
    border-color: #B5622A;
    color: #B5622A;
  }

  .adm-remove-link {
    background: none;
    border: none;
    color: #c0392b;
    cursor: pointer;
    font-size: 11px;
    padding: 0;
    font-family: 'DM Sans', sans-serif;
    margin-top: 4px;
    display: block;
  }
  /* Overview grid */
  .adm-overview {
    flex: 1;
    overflow-y: auto;
    padding: 28px 28px;
    background: #F8F6F2;
  }

  .adm-overview-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .adm-overview-title {
    font-family: 'DM Serif Display', serif;
    font-size: 24px;
    color: #1C1C1A;
    font-weight: 400;
  }

  .adm-overview-label {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #B5622A;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .adm-overview-filters {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
  }

  .adm-overview-pill {
    padding: 5px 14px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 500;
    border: 1.5px solid #D4C9BA;
    background: transparent;
    color: #6B6660;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }

  .adm-overview-pill:hover {
    border-color: #B5622A;
    color: #B5622A;
  }

  .adm-overview-pill.active {
    background: #1C1C1A;
    border-color: #1C1C1A;
    color: #F8F6F2;
  }

  .adm-overview-search {
    border: 1.5px solid #D4C9BA;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    color: #1C1C1A;
    background: #fff;
    transition: border-color 0.15s;
    width: 180px;
  }

  .adm-overview-search:focus {
    border-color: #B5622A;
  }

  .adm-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 14px;
  }

  @media (max-width: 1300px) { .adm-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
  @media (max-width: 1000px) { .adm-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  @media (max-width: 700px)  { .adm-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

  .adm-grid-card {
    background: #fff;
    border: 1px solid #EDE9E3;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    position: relative;
  }

  .adm-grid-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(28,28,26,0.08);
  }

  .adm-grid-poster {
    height: 160px;
    background: #EDE9E3;
    position: relative;
    overflow: hidden;
  }

  .adm-grid-poster img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .adm-grid-poster-empty {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #C4BAB0;
    font-size: 28px;
  }

  .adm-grid-type-badge {
    position: absolute;
    top: 7px;
    left: 7px;
    font-size: 9px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 100px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-family: 'DM Sans', sans-serif;
  }

  .adm-grid-mpa {
    position: absolute;
    top: 7px;
    right: 7px;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(0,0,0,0.45);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
  }

  .adm-grid-body {
    padding: 10px 11px 11px;
  }

  .adm-grid-title {
    font-size: 12px;
    font-weight: 600;
    color: #1C1C1A;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 3px;
  }

  .adm-grid-meta {
    font-size: 10px;
    color: #9A9390;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .adm-grid-delete {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(28,28,26,0.55);
    color: #F8F6F2;
    border: none;
    cursor: pointer;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s, background 0.15s;
  }

  .adm-grid-card:hover .adm-grid-delete {
    opacity: 1;
  }

  .adm-grid-delete:hover {
    background: #c0392b;
  }

  .adm-people-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 14px;
  }

  @media (max-width: 1300px) { .adm-people-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
  @media (max-width: 1000px) { .adm-people-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

  .adm-person-card {
    background: #fff;
    border: 1px solid #EDE9E3;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    position: relative;
    padding: 16px 12px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .adm-person-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(28,28,26,0.08);
  }

  .adm-person-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #EDE9E3;
    overflow: hidden;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
  }

  .adm-person-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .adm-person-name {
    font-size: 12px;
    font-weight: 600;
    color: #1C1C1A;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }

  .adm-person-meta {
    font-size: 10px;
    color: #9A9390;
    margin-top: 2px;
  }

  .adm-person-delete {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(28,28,26,0.5);
    color: #F8F6F2;
    border: none;
    cursor: pointer;
    font-size: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s, background 0.15s;
  }

  .adm-person-card:hover .adm-person-delete {
    opacity: 1;
  }

  .adm-person-delete:hover {
    background: #c0392b;
  }

  .adm-add-new-card {
    background: transparent;
    border: 2px dashed #D4C9BA;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: #C4BAB0;
    transition: all 0.15s;
    min-height: 120px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    gap: 6px;
  }

  .adm-add-new-card:hover {
    border-color: #B5622A;
    color: #B5622A;
    background: #FDF0E8;
  }

`

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('media')

  return (
    <>
      <style>{adminStyles}</style>
      <div className="adm-root">
        <div className="adm-tabs">
          {[['media', '🎬 Media'], ['people', '👤 People']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`adm-tab${activeTab === key ? ' active' : ''}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="adm-body">
          {activeTab === 'media'  && <MediaTab />}
          {activeTab === 'people' && <PeopleTab />}
        </div>
      </div>
    </>
  )
}

function MediaTab() {
  const [media,         setMedia]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [selected,      setSelected]      = useState(null)
  const [form,          setForm]          = useState(EMPTY_MEDIA_FORM)
  const [posterFile,    setPosterFile]    = useState(null)
  const [posterPreview, setPosterPreview] = useState(null)
  const [saving,        setSaving]        = useState(false)
  const [deleting,      setDeleting]      = useState(false)
  const [error,         setError]         = useState(null)
  const [success,       setSuccess]       = useState(null)
  const [panelOpen,     setPanelOpen]     = useState(false)
  const [credits,       setCredits]       = useState([])
  const [allPeople,     setAllPeople]     = useState([])
  const [creditSearch,  setCreditSearch]  = useState('')
  const [creditPersonLocked, setCreditPersonLocked] = useState(false)
  const [creditRole,    setCreditRole]    = useState('actor')
  const [creditCharacter, setCreditCharacter] = useState('')
  const [addingCredit,  setAddingCredit]  = useState(false)
  const [seasons,       setSeasons]       = useState([])
  const [newSeasonTitle, setNewSeasonTitle] = useState('')
  const [newSeasonNum,  setNewSeasonNum]  = useState('')
  const [addingSeason,  setAddingSeason]  = useState(false)
  const [expandedSeason, setExpandedSeason] = useState(null)
  const [newEpNum,      setNewEpNum]      = useState('')
  const [newEpTitle,    setNewEpTitle]    = useState('')
  const [newEpRuntime,  setNewEpRuntime]  = useState('')
  const [addingEp,      setAddingEp]      = useState(false)
  const [typeFilter,    setTypeFilter]    = useState('all')

  const fileRef = useRef()

  useEffect(() => { fetchMedia() }, [])
  useEffect(() => {
    supabase.from('people').select('id, name').order('name').then(({ data }) => setAllPeople(data || []))
  }, [])

  async function fetchMedia() {
    setLoading(true)
    const { data } = await supabase.from('media').select('*').order('title', { ascending: true })
    setMedia(data || [])
    setLoading(false)
  }

  async function fetchCredits(mediaId) {
    const { data } = await supabase
      .from('media_credits')
      .select('id, role, character_name, credit_order, people(id, name)')
      .eq('media_id', mediaId)
      .order('role').order('credit_order')
    setCredits(data || [])
  }

  async function fetchSeasons(mediaId) {
    const { data } = await supabase
      .from('seasons')
      .select('*, episodes(id, episode_num, title, runtime_minutes)')
      .eq('media_id', mediaId)
      .order('season_num')
      .order('episode_num', { referencedTable: 'episodes' })
    setSeasons(data || [])
  }

  function openAdd() {
    setSelected(null); setForm(EMPTY_MEDIA_FORM)
    setPosterFile(null); setPosterPreview(null)
    setError(null); setSuccess(null)
    setCredits([]); setSeasons([])
    resetCreditForm(); setPanelOpen(true)
  }

  function openEdit(item) {
    setSelected(item)
    setForm({
      title: item.title || '', type: item.type || 'movie', genre: item.genre || '',
      overview: item.overview || '', release_year: item.release_year || '',
      end_year: item.end_year || '', runtime_minutes: item.runtime_minutes || '',
      mpa_rating: item.mpa_rating || '', imdb_rating: item.imdb_rating || '',
    })
    setPosterFile(null); setPosterPreview(getPosterUrl(item.poster_url))
    setError(null); setSuccess(null)
    resetCreditForm(); fetchCredits(item.id)
    if (item.type === 'tv') fetchSeasons(item.id); else setSeasons([])
    setPanelOpen(true)
  }

  function resetCreditForm() {
    setCreditSearch(''); setCreditPersonLocked(false)
    setCreditRole('actor'); setCreditCharacter('')
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required.'); return }
    setSaving(true); setError(null); setSuccess(null)
    let poster_url = selected?.poster_url || null
    if (posterFile) {
      const ext = posterFile.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { data: up, error: ue } = await supabase.storage.from('posters').upload(path, posterFile, { upsert: true })
      if (ue) { setError('Image upload failed: ' + ue.message); setSaving(false); return }
      poster_url = up.path
    }
    const payload = {
      title: form.title.trim(), type: form.type, genre: form.genre || null,
      overview: form.overview.trim() || null,
      release_year: form.release_year ? parseInt(form.release_year) : null,
      end_year: form.end_year ? parseInt(form.end_year) : null,
      runtime_minutes: form.runtime_minutes ? parseInt(form.runtime_minutes) : null,
      mpa_rating: form.mpa_rating || null,
      imdb_rating: form.imdb_rating ? parseFloat(form.imdb_rating) : null,
      poster_url,
    }
    let err
    if (selected) {
      ;({ error: err } = await supabase.from('media').update(payload).eq('id', selected.id))
    } else {
      ;({ error: err } = await supabase.from('media').insert([payload]))
    }
    if (err) setError(err.message)
    else {
      setSuccess(selected ? 'Updated successfully.' : 'Added successfully.')
      fetchMedia()
      if (!selected) { setForm(EMPTY_MEDIA_FORM); setPosterFile(null); setPosterPreview(null) }
    }
    setSaving(false)
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    setDeleting(true)
    if (item.poster_url && !item.poster_url.startsWith('http'))
      await supabase.storage.from('posters').remove([item.poster_url])
    await supabase.from('media').delete().eq('id', item.id)
    setMedia(prev => prev.filter(m => m.id !== item.id))
    if (selected?.id === item.id) setPanelOpen(false)
    setDeleting(false)
  }

  async function handleAddCredit() {
    const person = allPeople.find(p => p.name.toLowerCase() === creditSearch.toLowerCase())
    if (!person) { alert('Select a person from the suggestions.'); return }
    if (!selected) { alert('Save the media first before adding credits.'); return }
    setAddingCredit(true)
    const { error: e } = await supabase.from('media_credits').insert({
      media_id: selected.id, person_id: person.id, role: creditRole,
      character_name: creditRole === 'actor' && creditCharacter.trim() ? creditCharacter.trim() : null,
      credit_order: credits.filter(c => c.role === creditRole).length + 1,
    })
    if (e) alert('Error: ' + e.message)
    else { resetCreditForm(); fetchCredits(selected.id) }
    setAddingCredit(false)
  }

  async function handleRemoveCredit(creditId) {
    await supabase.from('media_credits').delete().eq('id', creditId)
    setCredits(prev => prev.filter(c => c.id !== creditId))
  }

  async function handleAddSeason(mediaId) {
    if (!newSeasonNum) { alert('Season number is required.'); return }
    setAddingSeason(true)
    const { error: e } = await supabase.from('seasons').insert({
      media_id: mediaId, season_num: parseInt(newSeasonNum),
      title: newSeasonTitle.trim() || `Season ${newSeasonNum}`,
    })
    if (e) alert('Error: ' + e.message)
    else { setNewSeasonNum(''); setNewSeasonTitle(''); fetchSeasons(mediaId) }
    setAddingSeason(false)
  }

  async function handleRemoveSeason(seasonId, mediaId) {
    if (!window.confirm('Delete this season and all its episodes?')) return
    await supabase.from('seasons').delete().eq('id', seasonId)
    fetchSeasons(mediaId)
  }

  async function handleAddEpisode(seasonId, mediaId) {
    if (!newEpNum) { alert('Episode number is required.'); return }
    setAddingEp(true)
    const { error: e } = await supabase.from('episodes').insert({
      season_id: seasonId, media_id: mediaId, episode_num: parseInt(newEpNum),
      title: newEpTitle.trim() || `Episode ${newEpNum}`,
      runtime_minutes: newEpRuntime ? parseInt(newEpRuntime) : null,
    })
    if (e) alert('Error: ' + e.message)
    else { setNewEpNum(''); setNewEpTitle(''); setNewEpRuntime(''); fetchSeasons(mediaId) }
    setAddingEp(false)
  }

  async function handleRemoveEpisode(episodeId, mediaId) {
    await supabase.from('episodes').delete().eq('id', episodeId)
    fetchSeasons(mediaId)
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const peopleSuggestions = creditSearch.length >= 1 && !creditPersonLocked
    ? allPeople.filter(p => p.name.toLowerCase().includes(creditSearch.toLowerCase())).slice(0, 6)
    : []

  const filtered = media.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || m.type === typeFilter
    return matchSearch && matchType
  })

  return (
    <>
      {/* Sidebar */}
      <div className={`adm-sidebar${panelOpen ? '' : ' collapsed'}`}>
        <div className="adm-sidebar-header">
          <input className="adm-search" value={search}
            onChange={e => setSearch(e.target.value)} placeholder="Search titles…" />
          <button className="adm-add-btn" onClick={openAdd}>+ Add</button>
        </div>
        {/* Type filter pills */}
        <div style={{ display: 'flex', gap: 6, padding: '10px 16px', borderBottom: '1px solid #F0EBE4' }}>
          {[['all', 'All'], ['movie', 'Films'], ['tv', 'TV']].map(([v, l]) => (
            <button key={v} onClick={() => setTypeFilter(v)} style={{
              padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 500,
              border: '1.5px solid', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              borderColor: typeFilter === v ? '#1C1C1A' : '#D4C9BA',
              background: typeFilter === v ? '#1C1C1A' : 'transparent',
              color: typeFilter === v ? '#F8F6F2' : '#6B6660',
            }}>{l}</button>
          ))}
          <span style={{ fontSize: 11, color: '#C4BAB0', marginLeft: 'auto', alignSelf: 'center' }}>
            {filtered.length}
          </span>
        </div>
        <div className="adm-list">
          {loading && <p style={{ padding: 20, color: '#9A9390', fontSize: 13 }}>Loading…</p>}
          {filtered.map(item => (
            <div key={item.id} className={`adm-list-item${selected?.id === item.id ? ' active' : ''}`}
              onClick={() => openEdit(item)}>
              <div className="adm-list-thumb">
                {getPosterUrl(item.poster_url)
                  ? <img src={getPosterUrl(item.poster_url)} alt="" />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4BAB0', fontSize: 8 }}>—</div>}
              </div>
              <div className="adm-list-info">
                <div className="adm-list-title">{item.title}</div>
                <div className="adm-list-meta">
                  {item.type === 'movie' ? 'Film' : 'TV'} · {item.release_year || '—'}
                  {item.mpa_rating ? ` · ${item.mpa_rating}` : ''}
                  {item.imdb_rating ? ` · 🍅${item.imdb_rating}%` : ''}
                </div>
              </div>
              <button className="adm-list-delete"
                onClick={e => { e.stopPropagation(); handleDelete(item) }} disabled={deleting}>✕</button>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <p style={{ padding: 20, color: '#C4BAB0', fontSize: 13 }}>No results</p>
          )}
        </div>
      </div>

      {/* Overview grid when no panel open */}
      {!panelOpen && (
        <div className="adm-overview">
          <div className="adm-overview-header">
            <div>
              <div className="adm-overview-label">Media Library</div>
              <div className="adm-overview-title">All Titles</div>
            </div>
            <div className="adm-overview-filters">
              {[['all', 'All'], ['movie', 'Films'], ['tv', 'TV']].map(([v, l]) => (
                <button key={v} onClick={() => setTypeFilter(v)}
                  className={`adm-overview-pill${typeFilter === v ? ' active' : ''}`}>{l}</button>
              ))}
              <input className="adm-overview-search" value={search}
                onChange={e => setSearch(e.target.value)} placeholder="Search…" />
              <button className="adm-add-btn" onClick={openAdd}>+ Add title</button>
            </div>
          </div>
          <div className="adm-grid">
            <div className="adm-add-new-card" onClick={openAdd}>
              <span style={{ fontSize: 22 }}>＋</span>
              Add title
            </div>
            {filtered.map(item => (
              <div key={item.id} className="adm-grid-card" onClick={() => openEdit(item)}>
                <div className="adm-grid-poster">
                  {getPosterUrl(item.poster_url)
                    ? <img src={getPosterUrl(item.poster_url)} alt={item.title} />
                    : <div className="adm-grid-poster-empty">🎬</div>}
                  <span className="adm-grid-type-badge" style={{
                    background: item.type === 'movie' ? 'rgba(181,98,42,0.9)' : 'rgba(28,28,26,0.75)',
                    color: '#fff',
                  }}>
                    {item.type === 'movie' ? 'Film' : 'TV'}
                  </span>
                  {item.mpa_rating && <span className="adm-grid-mpa">{item.mpa_rating}</span>}
                </div>
                <div className="adm-grid-body">
                  <div className="adm-grid-title">{item.title}</div>
                  <div className="adm-grid-meta">
                    {item.release_year || '—'}
                    {item.genre ? ` · ${item.genre}` : ''}
                    {item.imdb_rating ? ` · 🍅${item.imdb_rating}%` : ''}
                  </div>
                </div>
                <button className="adm-grid-delete"
                  onClick={e => { e.stopPropagation(); handleDelete(item) }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel */}
      {panelOpen && (
        <div className="adm-panel">
          <div className="adm-panel-header">
            <div>
              <div className="adm-panel-label">{selected ? 'Editing' : 'New title'}</div>
              <div className="adm-panel-title">{selected ? selected.title : 'Add media'}</div>
            </div>
            <button className="adm-close-btn" onClick={() => setPanelOpen(false)}>✕</button>
          </div>

          {error   && <div className="adm-error">{error}</div>}
          {success && <div className="adm-success">{success}</div>}

          {/* Basic info */}
          <div className="adm-form-card">
            <div className="adm-form-card-title">Basic Info</div>
            <div className="adm-grid-2">
              <div className="adm-field adm-col-span-2">
                <label>Title *</label>
                <input value={form.title} onChange={set('title')} placeholder="e.g. The Godfather" />
              </div>
              <div className="adm-field">
                <label>Type</label>
                <select value={form.type} onChange={set('type')}>
                  <option value="movie">Movie</option>
                  <option value="tv">TV Series</option>
                </select>
              </div>
              <div className="adm-field">
                <label>Genre</label>
                <select value={form.genre} onChange={set('genre')}>
                  <option value="">— none —</option>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="adm-field">
                <label>Release year</label>
                <input type="number" value={form.release_year} onChange={set('release_year')} placeholder="e.g. 1972" min={1888} max={2100} />
              </div>
              {form.type === 'tv' ? (
                <div className="adm-field">
                  <label>End year</label>
                  <input type="number" value={form.end_year} onChange={set('end_year')} placeholder="Leave blank if ongoing" min={1888} max={2100} />
                </div>
              ) : <div />}
              <div className="adm-field">
                <label>Runtime (min)</label>
                <input type="number" value={form.runtime_minutes} onChange={set('runtime_minutes')} placeholder="e.g. 175" min={1} />
              </div>
              <div className="adm-field">
                <label>MPA Rating</label>
                <select value={form.mpa_rating} onChange={set('mpa_rating')}>
                  <option value="">— none —</option>
                  {MPA_RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="adm-field">
                <label>RT Score (%)</label>
                <input type="number" value={form.imdb_rating} onChange={set('imdb_rating')} placeholder="e.g. 94" min={0} max={100} />
              </div>
              <div className="adm-field adm-col-span-2">
                <label>Overview</label>
                <textarea value={form.overview} onChange={set('overview')} rows={3} placeholder="Short description…" />
              </div>
            </div>
          </div>

          {/* Poster */}
          <div className="adm-form-card">
            <div className="adm-form-card-title">Poster Image</div>
            <div className="adm-poster-wrap">
              <div className="adm-poster-preview">
                {posterPreview
                  ? <img src={posterPreview} alt="preview" />
                  : <span>No<br/>image</span>}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/*"
                  onChange={e => { const f = e.target.files[0]; if (!f) return; setPosterFile(f); setPosterPreview(URL.createObjectURL(f)) }}
                  style={{ display: 'none' }} />
                <button className="adm-upload-btn" onClick={() => fileRef.current.click()}>
                  {posterPreview ? 'Change image' : 'Upload image'}
                </button>
                {posterFile && <p style={{ fontSize: 11, color: '#9A9390', marginTop: 4 }}>{posterFile.name}</p>}
                {posterPreview && !posterFile && (
                  <button className="adm-remove-link"
                    onClick={() => { setPosterPreview(null); setPosterFile(null) }}>
                    Remove image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Save / Delete */}
          <div className="adm-btn-row" style={{ marginBottom: 16 }}>
            <button className="adm-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : selected ? 'Save changes' : 'Add media'}
            </button>
            {selected && (
              <button className="adm-delete-btn" onClick={() => handleDelete(selected)} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
          </div>

          {/* Seasons & Episodes — TV only, after save */}
          {selected && selected.type === 'tv' && (
            <div className="adm-form-card">
              <div className="adm-form-card-title">Seasons &amp; Episodes</div>
              {seasons.map(season => (
                <div key={season.id} className="adm-season-card">
                  <div className="adm-season-header"
                    onClick={() => setExpandedSeason(expandedSeason === season.id ? null : season.id)}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1A' }}>
                      {season.title || `Season ${season.season_num}`}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: '#9A9390' }}>{season.episodes?.length || 0} episodes</span>
                      <span style={{ fontSize: 11, color: '#B5622A' }}>{expandedSeason === season.id ? '▴' : '▾'}</span>
                      <button onClick={e => { e.stopPropagation(); handleRemoveSeason(season.id, selected.id) }}
                        style={{ background: 'none', border: 'none', color: '#D4C9BA', cursor: 'pointer', fontSize: 12, padding: 2 }}>✕</button>
                    </div>
                  </div>
                  {expandedSeason === season.id && (
                    <div style={{ padding: '10px 14px' }}>
                      {season.episodes?.map(ep => (
                        <div key={ep.id} className="adm-ep-row">
                          <span style={{ fontSize: 11, color: '#C4BAB0', minWidth: 22, fontWeight: 600 }}>{ep.episode_num}</span>
                          <span style={{ fontSize: 12, flex: 1, color: '#1C1C1A' }}>{ep.title}</span>
                          {ep.runtime_minutes && <span style={{ fontSize: 11, color: '#9A9390' }}>{ep.runtime_minutes}m</span>}
                          <button onClick={() => handleRemoveEpisode(ep.id, selected.id)}
                            style={{ background: 'none', border: 'none', color: '#D4C9BA', cursor: 'pointer', fontSize: 11 }}>✕</button>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                        <input type="number" value={newEpNum} onChange={e => setNewEpNum(e.target.value)}
                          placeholder="Ep #" style={{ ...inputStyle, width: 64 }} min={1} />
                        <input value={newEpTitle} onChange={e => setNewEpTitle(e.target.value)}
                          placeholder="Title" style={{ ...inputStyle, flex: 1, minWidth: 100 }} />
                        <input type="number" value={newEpRuntime} onChange={e => setNewEpRuntime(e.target.value)}
                          placeholder="Min" style={{ ...inputStyle, width: 60 }} min={1} />
                        <button onClick={() => handleAddEpisode(season.id, selected.id)}
                          disabled={addingEp || !newEpNum}
                          style={{ ...smallBtnStyle, opacity: !newEpNum ? 0.5 : 1 }}>
                          {addingEp ? '…' : '+ Episode'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <input type="number" value={newSeasonNum} onChange={e => setNewSeasonNum(e.target.value)}
                  placeholder="Season #" style={{ ...inputStyle, width: 90 }} min={1} />
                <input value={newSeasonTitle} onChange={e => setNewSeasonTitle(e.target.value)}
                  placeholder="Title (optional)" style={{ ...inputStyle, flex: 1, minWidth: 100 }} />
                <button onClick={() => handleAddSeason(selected.id)}
                  disabled={addingSeason || !newSeasonNum}
                  style={{ ...smallBtnStyle, opacity: !newSeasonNum ? 0.5 : 1 }}>
                  {addingSeason ? '…' : '+ Season'}
                </button>
              </div>
            </div>
          )}

          {/* Cast & Crew — after save */}
          {selected && (
            <div className="adm-form-card">
              <div className="adm-form-card-title">Cast &amp; Crew</div>
              {credits.length === 0 && <p style={{ fontSize: 12, color: '#C4BAB0', marginBottom: 12 }}>No credits yet.</p>}
              {credits.map(c => (
                <div key={c.id} className="adm-credit-item">
                  <span className="adm-role-badge" style={{ background: ROLE_COLORS[c.role].bg, color: ROLE_COLORS[c.role].color }}>
                    {ROLE_LABELS[c.role]}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1, color: '#1C1C1A' }}>{c.people?.name}</span>
                  {c.character_name && <span style={{ fontSize: 11, color: '#9A9390' }}>as {c.character_name}</span>}
                  <button onClick={() => handleRemoveCredit(c.id)}
                    style={{ background: 'none', border: 'none', color: '#D4C9BA', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              ))}
              <div style={{ marginTop: 12, background: '#F8F6F2', borderRadius: 10, padding: 14, border: '1px solid #EDE9E3' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#9A9390', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Add credit</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 8 }}>
                  <div style={{ position: 'relative' }}>
                    <input value={creditSearch}
                      onChange={e => { setCreditSearch(e.target.value); setCreditPersonLocked(false) }}
                      placeholder="Search people…" style={inputStyle} />
                    {peopleSuggestions.length > 0 && (
                      <div className="adm-suggestions">
                        {peopleSuggestions.map(p => (
                          <div key={p.id} className="adm-suggestion-item"
                            onClick={() => { setCreditSearch(p.name); setCreditPersonLocked(true) }}>
                            {p.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <select value={creditRole} onChange={e => setCreditRole(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                {creditRole === 'actor' && (
                  <input value={creditCharacter} onChange={e => setCreditCharacter(e.target.value)}
                    placeholder="Character name (optional)" style={{ ...inputStyle, marginBottom: 8 }} />
                )}
                <button onClick={handleAddCredit} disabled={addingCredit || !creditSearch.trim()}
                  style={{ ...smallBtnStyle, opacity: !creditSearch.trim() ? 0.5 : 1 }}>
                  {addingCredit ? 'Adding…' : '+ Add credit'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

function PeopleTab() {
  const [people,       setPeople]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [selected,     setSelected]     = useState(null)
  const [form,         setForm]         = useState(EMPTY_PERSON_FORM)
  const [photoFile,    setPhotoFile]    = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [deleting,     setDeleting]     = useState(false)
  const [error,        setError]        = useState(null)
  const [success,      setSuccess]      = useState(null)
  const [panelOpen,    setPanelOpen]    = useState(false)

  const fileRef = useRef()

  useEffect(() => { fetchPeople() }, [])

  async function fetchPeople() {
    setLoading(true)
    const { data } = await supabase.from('people').select('*').order('name')
    setPeople(data || [])
    setLoading(false)
  }

  function getPhotoUrl(photoUrl) {
    if (!photoUrl) return null
    if (photoUrl.startsWith('http')) return photoUrl
    const { data } = supabase.storage.from('posters').getPublicUrl(photoUrl)
    return data.publicUrl
  }

  function openAdd() {
    setSelected(null); setForm(EMPTY_PERSON_FORM)
    setPhotoFile(null); setPhotoPreview(null)
    setError(null); setSuccess(null); setPanelOpen(true)
  }

  function openEdit(person) {
    setSelected(person)
    setForm({ name: person.name || '', bio: person.bio || '', born_year: person.born_year || '', died_year: person.died_year || '' })
    setPhotoFile(null); setPhotoPreview(getPhotoUrl(person.photo_url))
    setError(null); setSuccess(null); setPanelOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError(null); setSuccess(null)
    let photo_url = selected?.photo_url || null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `people/${Date.now()}.${ext}`
      const { data: up, error: ue } = await supabase.storage.from('posters').upload(path, photoFile, { upsert: true })
      if (ue) { setError('Photo upload failed: ' + ue.message); setSaving(false); return }
      photo_url = up.path
    }
    const payload = {
      name: form.name.trim(), bio: form.bio.trim() || null,
      born_year: form.born_year ? parseInt(form.born_year) : null,
      died_year: form.died_year ? parseInt(form.died_year) : null,
      photo_url,
    }
    let err
    if (selected) {
      ;({ error: err } = await supabase.from('people').update(payload).eq('id', selected.id))
    } else {
      ;({ error: err } = await supabase.from('people').insert([payload]))
    }
    if (err) setError(err.message)
    else {
      setSuccess(selected ? 'Updated successfully.' : 'Person added.')
      fetchPeople()
      if (!selected) { setForm(EMPTY_PERSON_FORM); setPhotoFile(null); setPhotoPreview(null) }
    }
    setSaving(false)
  }

  async function handleDelete(person) {
    if (!window.confirm(`Delete "${person.name}"?`)) return
    setDeleting(true)
    if (person.photo_url && !person.photo_url.startsWith('http'))
      await supabase.storage.from('posters').remove([person.photo_url])
    await supabase.from('people').delete().eq('id', person.id)
    setPeople(prev => prev.filter(p => p.id !== person.id))
    if (selected?.id === person.id) setPanelOpen(false)
    setDeleting(false)
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const filtered = people.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <div className={`adm-sidebar${panelOpen ? '' : ' collapsed'}`}>
        <div className="adm-sidebar-header">
          <input className="adm-search" value={search}
            onChange={e => setSearch(e.target.value)} placeholder="Search people…" />
          <button className="adm-add-btn" onClick={openAdd}>+ Add</button>
        </div>
        <div style={{ padding: '8px 16px', borderBottom: '1px solid #F0EBE4' }}>
          <span style={{ fontSize: 11, color: '#C4BAB0' }}>{filtered.length} people</span>
        </div>
        <div className="adm-list">
          {loading && <p style={{ padding: 20, color: '#9A9390', fontSize: 13 }}>Loading…</p>}
          {filtered.map(person => (
            <div key={person.id} className={`adm-list-item${selected?.id === person.id ? ' active' : ''}`}
              onClick={() => openEdit(person)}>
              <div className="adm-list-thumb-person">
                {getPhotoUrl(person.photo_url)
                  ? <img src={getPhotoUrl(person.photo_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '👤'}
              </div>
              <div className="adm-list-info">
                <div className="adm-list-title">{person.name}</div>
                <div className="adm-list-meta">
                  {person.born_year ? `b. ${person.born_year}` : ''}
                  {person.born_year && person.died_year ? ' – ' : ''}
                  {person.died_year ? `d. ${person.died_year}` : ''}
                </div>
              </div>
              <button className="adm-list-delete"
                onClick={e => { e.stopPropagation(); handleDelete(person) }} disabled={deleting}>✕</button>
            </div>
          ))}
          {!loading && filtered.length === 0 && <p style={{ padding: 20, color: '#C4BAB0', fontSize: 13 }}>No results</p>}
        </div>
      </div>

      {!panelOpen && (
        <div className="adm-overview">
          <div className="adm-overview-header">
            <div>
              <div className="adm-overview-label">People</div>
              <div className="adm-overview-title">Cast &amp; Crew</div>
            </div>
            <div className="adm-overview-filters">
              <input className="adm-overview-search" value={search}
                onChange={e => setSearch(e.target.value)} placeholder="Search…" />
              <button className="adm-add-btn" onClick={openAdd}>+ Add person</button>
            </div>
          </div>
          <div className="adm-people-grid">
            <div className="adm-add-new-card" onClick={openAdd}>
              <span style={{ fontSize: 22 }}>＋</span>
              Add person
            </div>
            {filtered.map(person => (
              <div key={person.id} className="adm-person-card" onClick={() => openEdit(person)}>
                <div className="adm-person-avatar">
                  {getPhotoUrl(person.photo_url)
                    ? <img src={getPhotoUrl(person.photo_url)} alt={person.name} />
                    : '👤'}
                </div>
                <div className="adm-person-name">{person.name}</div>
                <div className="adm-person-meta">
                  {person.born_year ? `b. ${person.born_year}` : ''}
                  {person.born_year && person.died_year ? ' – ' : ''}
                  {person.died_year ? `d. ${person.died_year}` : ''}
                </div>
                <button className="adm-person-delete"
                  onClick={e => { e.stopPropagation(); handleDelete(person) }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {panelOpen && (
        <div className="adm-panel">
          <div className="adm-panel-header">
            <div>
              <div className="adm-panel-label">{selected ? 'Editing' : 'New person'}</div>
              <div className="adm-panel-title">{selected ? selected.name : 'Add person'}</div>
            </div>
            <button className="adm-close-btn" onClick={() => setPanelOpen(false)}>✕</button>
          </div>

          {error   && <div className="adm-error">{error}</div>}
          {success && <div className="adm-success">{success}</div>}

          <div className="adm-form-card">
            <div className="adm-form-card-title">Details</div>
            <div className="adm-grid-2">
              <div className="adm-field adm-col-span-2">
                <label>Name *</label>
                <input value={form.name} onChange={set('name')} placeholder="e.g. Christopher Nolan" />
              </div>
              <div className="adm-field">
                <label>Born year</label>
                <input type="number" value={form.born_year} onChange={set('born_year')} placeholder="e.g. 1970" min={1800} max={2020} />
              </div>
              <div className="adm-field">
                <label>Died year</label>
                <input type="number" value={form.died_year} onChange={set('died_year')} placeholder="Leave blank if alive" min={1800} max={2100} />
              </div>
              <div className="adm-field adm-col-span-2">
                <label>Bio</label>
                <textarea value={form.bio} onChange={set('bio')} rows={4} placeholder="Short biography…" />
              </div>
            </div>
          </div>

          <div className="adm-form-card">
            <div className="adm-form-card-title">Photo</div>
            <div className="adm-poster-wrap">
              <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: '#EDE9E3', border: '1px solid #E4DDD4', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                {photoPreview ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/*"
                  onChange={e => { const f = e.target.files[0]; if (!f) return; setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)) }}
                  style={{ display: 'none' }} />
                <button className="adm-upload-btn" onClick={() => fileRef.current.click()}>
                  {photoPreview ? 'Change photo' : 'Upload photo'}
                </button>
                {photoFile && <p style={{ fontSize: 11, color: '#9A9390', marginTop: 4 }}>{photoFile.name}</p>}
                {photoPreview && !photoFile && (
                  <button className="adm-remove-link" onClick={() => { setPhotoPreview(null); setPhotoFile(null) }}>
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="adm-btn-row">
            <button className="adm-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : selected ? 'Save changes' : 'Add person'}
            </button>
            {selected && (
              <button className="adm-delete-btn" onClick={() => handleDelete(selected)} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

const inputStyle = {
  border: '1.5px solid #D4C9BA', borderRadius: 8, padding: '8px 10px',
  fontSize: 12, outline: 'none', background: '#fff', fontFamily: 'DM Sans, sans-serif',
  color: '#1C1C1A', boxSizing: 'border-box', width: '100%',
}

const smallBtnStyle = {
  background: '#1C1C1A', color: '#F8F6F2', border: 'none', borderRadius: 8,
  padding: '8px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
}
