import React, { useState, useEffect } from 'react'
import supabase from './config/supabaseClient'

import AuthPage from './components/AuthPage'
import BrowsePage from './components/BrowsePage'
import DetailPage from './components/DetailPage'
import PersonPage from './components/PersonPage'
import WatchlistPage from './components/WatchlistPage'
import RecommendationsPage from './components/RecommendationsPage'
import HiddenGemsPage from './components/HiddenGemsPage'
import AdminPage from './components/AdminPage'
import SqlPage from './components/SqlPage'
import Navbar from './components/Navbar'

const darkModeStyles = `
  body.dark-mode {
    --bg: #141414;
    --surface: #1E1E1E;
    --border: #2A2A2A;
    --text: #F0EDE8;
    --text-muted: #888;
    --accent: #C8713A;
  }

  body.dark-mode {
    background: #141414 !important;
  }
  
  body.dark-mode .wl-stat-value {
    color: #F0EDE8 !important;
  }

  body.dark-mode .wl-stat-label {
    color: #666 !important;
  }

  body.dark-mode .wl-genre-name {
    color: #C0BAB4 !important;
  }

  body.dark-mode .wl-genre-track {
    background: #2A2A2A !important;
  }

  body.dark-mode .browse-root,
  body.dark-mode .wl-root,
  body.dark-mode .rp-root,
  body.dark-mode .hg-root,
  body.dark-mode .adm-root,
  body.dark-mode .sql-root,
  body.dark-mode .auth-root {
    background: #141414 !important;
  }

  body.dark-mode .navbar {
    background: #1A1A1A !important;
    border-bottom-color: #2A2A2A !important;
  }

  body.dark-mode .navbar-logo-mark { color: #F0EDE8 !important; }
  body.dark-mode .navbar-link { color: #888 !important; }
  body.dark-mode .navbar-link:hover { background: #2A2A2A !important; color: #F0EDE8 !important; }
  body.dark-mode .navbar-link.active { background: #2A2A2A !important; color: #F0EDE8 !important; }
  body.dark-mode .navbar-dropdown { background: #1E1E1E !important; border-color: #2A2A2A !important; }
  body.dark-mode .navbar-dropdown-username { color: #F0EDE8 !important; }
  body.dark-mode .navbar-dropdown-item { color: #C0BAB4 !important; }
  body.dark-mode .navbar-dropdown-item:hover { background: #2A2A2A !important; }
  body.dark-mode .navbar-username-chip { color: #666 !important; }

  body.dark-mode .media-card,
  body.dark-mode .wl-stat-card,
  body.dark-mode .wl-genre-bar,
  body.dark-mode .adm-form-card,
  body.dark-mode .lb-card,
  body.dark-mode .adm-sidebar,
  body.dark-mode .sql-sidebar,
  body.dark-mode .sql-editor-wrap,
  body.dark-mode .sql-table-wrap {
    background: #1E1E1E !important;
    border-color: #2A2A2A !important;
  }

  body.dark-mode .media-card-title,
  body.dark-mode .wl-page-title,
  body.dark-mode .rp-page-title,
  body.dark-mode .hg-title,
  body.dark-mode .adm-panel-title,
  body.dark-mode .adm-overview-title,
  body.dark-mode .adm-list-title,
  body.dark-mode .lb-section-title,
  body.dark-mode .sql-results-label,
  body.dark-mode .sql-editor-label {
    color: #F0EDE8 !important;
  }

  body.dark-mode .media-card-poster,
  body.dark-mode .adm-grid-poster,
  body.dark-mode .adm-person-avatar,
  body.dark-mode .hg-skeleton,
  body.dark-mode .skeleton-card {
    background: #2A2A2A !important;
  }

  body.dark-mode .search-input {
    color: #F0EDE8 !important;
    border-bottom-color: #3A3A3A !important;
  }

  body.dark-mode .adm-field input,
  body.dark-mode .adm-field select,
  body.dark-mode .adm-field textarea,
  body.dark-mode .sql-textarea,
  body.dark-mode .sql-title-input,
  body.dark-mode .adm-search,
  body.dark-mode .adm-overview-search {
    background: #2A2A2A !important;
    border-color: #3A3A3A !important;
    color: #F0EDE8 !important;
  }

  body.dark-mode .filter-pill,
  body.dark-mode .mood-btn,
  body.dark-mode .wl-tab,
  body.dark-mode .rp-filter-pill,
  body.dark-mode .adm-overview-pill,
  body.dark-mode .sql-quick-btn,
  body.dark-mode .sql-save-btn,
  body.dark-mode .wl-share-btn {
    border-color: #3A3A3A !important;
    color: #888 !important;
    background: transparent !important;
  }

  body.dark-mode .filter-pill.active,
  body.dark-mode .wl-tab.active,
  body.dark-mode .rp-filter-pill.active,
  body.dark-mode .adm-overview-pill.active {
    background: #F0EDE8 !important;
    border-color: #F0EDE8 !important;
    color: #141414 !important;
  }

  body.dark-mode .results-meta,
  body.dark-mode .wl-meta,
  body.dark-mode .hg-meta,
  body.dark-mode .rp-page-sub,
  body.dark-mode .hg-sub,
  body.dark-mode .media-card-year-genre,
  body.dark-mode .media-card-imdb,
  body.dark-mode .adm-list-meta,
  body.dark-mode .lb-section-sub {
    color: #666 !important;
  }

  body.dark-mode .filter-select {
    background-color: transparent !important;
    border-color: #3A3A3A !important;
    color: #888 !important;
  }

  body.dark-mode .sql-table th { background: #1A1A1A !important; color: #666 !important; }
  body.dark-mode .sql-table td { color: #C0BAB4 !important; border-color: #2A2A2A !important; }
  body.dark-mode .sql-table tr:hover td { background: #242424 !important; }

  body.dark-mode .adm-list-item:hover { background: #242424 !important; }
  body.dark-mode .adm-list-item.active { background: #2A1A10 !important; }

  body.dark-mode .wl-modal { background: #1E1E1E !important; }
  body.dark-mode .wl-modal-title { color: #F0EDE8 !important; }
  body.dark-mode .wl-modal-list { background: #2A2A2A !important; border-color: #3A3A3A !important; color: #C0BAB4 !important; }

  body.dark-mode .adm-panel {
    background: #141414 !important;
  }

  body.dark-mode .adm-tabs {
    background: #1A1A1A !important;
    border-bottom-color: #2A2A2A !important;
  }

  body.dark-mode .adm-tab {
    color: #666 !important;
  }

  body.dark-mode .adm-tab.active {
    color: #F0EDE8 !important;
    border-bottom-color: #C8713A !important;
  }

  body.dark-mode .adm-overview {
    background: #141414 !important;
  }

  body.dark-mode .adm-grid-card,
  body.dark-mode .adm-person-card,
  body.dark-mode .adm-season-card,
  body.dark-mode .adm-credit-item {
    background: #1E1E1E !important;
    border-color: #2A2A2A !important;
  }

  body.dark-mode .adm-grid-title,
  body.dark-mode .adm-panel-title,
  body.dark-mode .adm-person-name,
  body.dark-mode .adm-list-title {
    color: #F0EDE8 !important;
  }

  body.dark-mode .adm-add-new-card {
    border-color: #3A3A3A !important;
    color: #555 !important;
  }

  body.dark-mode .adm-add-new-card:hover {
    border-color: #C8713A !important;
    color: #C8713A !important;
    background: #1A0F08 !important;
  }

  body.dark-mode .adm-form-card-title {
    color: #666 !important;
  }

  body.dark-mode .adm-field label {
    color: #666 !important;
  }

  body.dark-mode .adm-season-header {
    background: #242424 !important;
  }
  
  body.dark-mode .adm-root,
  body.dark-mode .sql-main {
    background: #141414 !important;
  }

  /* Detail page */
  body.dark-mode .media-card,
  body.dark-mode [style*="maxWidth: 900"],
  body.dark-mode [style*="max-width: 900"] {
    background: #141414 !important;
  }

  body.dark-mode [style*="background: #F8F6F2"],
  body.dark-mode [style*="background: '#F8F6F2'"] {
    background: #141414 !important;
  }

  body.dark-mode [style*="color: '#1C1C1A'"],
  body.dark-mode [style*="color: #1C1C1A"] {
    color: #F0EDE8 !important;
  }

  body.dark-mode [style*="color: '#4A4440'"],
  body.dark-mode [style*="color: #4A4440"] {
    color: #C0BAB4 !important;
  }

  body.dark-mode [style*="color: '#9A9390'"],
  body.dark-mode [style*="color: #9A9390"] {
    color: #666 !important;
  }

  body.dark-mode [style*="borderTop: '1px solid #E4DDD4'"],
  body.dark-mode [style*="border: '1px solid #E4DDD4'"],
  body.dark-mode [style*="borderBottom: '1px solid #F0EBE4'"] {
    border-color: #2A2A2A !important;
  }

  body.dark-mode [style*="background: '#fff'"],
  body.dark-mode [style*="background: '#ffffff'"],
  body.dark-mode [style*="background: #fff"] {
    background: #1E1E1E !important;
  }

  body.dark-mode [style*="border: '1px solid #EDE9E3'"],
  body.dark-mode [style*="border: '1.5px solid #D4C9BA'"] {
    border-color: #2A2A2A !important;
  }

  body.dark-mode textarea,
  body.dark-mode input[type="text"],
  body.dark-mode input[type="email"],
  body.dark-mode input[type="password"],
  body.dark-mode input[type="number"] {
    background: #2A2A2A !important;
    color: #F0EDE8 !important;
    border-color: #3A3A3A !important;
  }

  /* Person page, detail page containers */
  body.dark-mode div[style*="minHeight: '100vh'"],
  body.dark-mode div[style*="min-height: 100vh"] {
    background: #141414 !important;
  }
`

export default function App() {
  const [session,     setSession]     = useState(null)
  const [profile,     setProfile]     = useState(null)
  const [page,        setPage]        = useState('browse')
  const [detailId,    setDetailId]    = useState(null)
  const [personId,    setPersonId]    = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [darkMode,    setDarkMode]    = useState(() => localStorage.getItem('cinedb-dark') === 'true')

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode)
    localStorage.setItem('cinedb-dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) fetchProfile(data.session.user.id)
      else setLoadingAuth(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else { setProfile(null); setLoadingAuth(false) }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoadingAuth(false)
  }

  function navigate(target, id = null) {
    setPage(target)
    if (target === 'detail') setDetailId(id)
    if (target === 'person') setPersonId(id)
  }

  if (loadingAuth) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: darkMode ? '#141414' : '#F8F6F2' }}>
        <p style={{ color: '#888', fontSize: 14 }}>Loading…</p>
      </div>
    )
  }

  if (!session) return <AuthPage onAuth={() => {}} />

  return (
    <>
      <style>{darkModeStyles}</style>
      <div style={{ minHeight: '100vh', background: darkMode ? '#141414' : '#F8F6F2' }}>
        <Navbar
          profile={profile}
          currentPage={page}
          navigate={navigate}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(d => !d)}
          onSignOut={async () => { await supabase.auth.signOut(); setPage('browse') }}
        />

        <div style={{ paddingTop: 62 }}>
          {page === 'browse'          && <BrowsePage navigate={navigate} session={session} profile={profile} />}
          {page === 'detail'          && <DetailPage mediaId={detailId} navigate={navigate} session={session} profile={profile} />}
          {page === 'person'          && <PersonPage personId={personId} navigate={navigate} />}
          {page === 'watchlist'       && <WatchlistPage navigate={navigate} session={session} profile={profile} />}
          {page === 'recommendations' && <RecommendationsPage navigate={navigate} session={session} profile={profile} />}
          {page === 'gems'            && <HiddenGemsPage navigate={navigate} session={session} profile={profile} />}
          {page === 'admin' && profile?.is_admin && <AdminPage navigate={navigate} session={session} profile={profile} />}
          {page === 'sql'             && <SqlPage session={session} profile={profile} />}
        </div>
      </div>
    </>
  )
}
