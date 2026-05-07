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
  body.dark-mode { background: #141414 !important; }

  /* Layout roots */
  body.dark-mode .browse-root,
  body.dark-mode .wl-root,
  body.dark-mode .rp-root,
  body.dark-mode .hg-root,
  body.dark-mode .adm-root,
  body.dark-mode .sql-root,
  body.dark-mode .auth-root,
  body.dark-mode .sql-main { background: #141414 !important; }

  /* Navbar */
  body.dark-mode .navbar { background: #1A1A1A !important; border-bottom-color: #2A2A2A !important; }
  body.dark-mode .navbar-logo-mark { color: #F0EDE8 !important; }
  body.dark-mode .navbar-link { color: #888 !important; }
  body.dark-mode .navbar-link:hover { background: #2A2A2A !important; color: #F0EDE8 !important; }
  body.dark-mode .navbar-link.active { background: #2A2A2A !important; color: #F0EDE8 !important; }
  body.dark-mode .navbar-dropdown { background: #1E1E1E !important; border-color: #2A2A2A !important; }
  body.dark-mode .navbar-dropdown-username { color: #F0EDE8 !important; }
  body.dark-mode .navbar-dropdown-item { color: #C0BAB4 !important; }
  body.dark-mode .navbar-dropdown-item:hover { background: #2A2A2A !important; }
  body.dark-mode .navbar-username-chip { color: #666 !important; }

  /* Media cards */
  body.dark-mode .media-card { background: #1E1E1E !important; border-color: #2A2A2A !important; }
  body.dark-mode .media-card-title { color: #F0EDE8 !important; }
  body.dark-mode .media-card-poster { background: #2A2A2A !important; }
  body.dark-mode .media-card-year-genre, body.dark-mode .media-card-imdb { color: #666 !important; }

  /* Browse */
  body.dark-mode .search-input { color: #F0EDE8 !important; border-bottom-color: #3A3A3A !important; }
  body.dark-mode .results-meta { color: #666 !important; }
  body.dark-mode .filter-pill, body.dark-mode .mood-btn { border-color: #3A3A3A !important; color: #888 !important; background: transparent !important; }
  body.dark-mode .filter-pill.active { background: #F0EDE8 !important; border-color: #F0EDE8 !important; color: #141414 !important; }
  body.dark-mode .filter-select { background-color: transparent !important; border-color: #3A3A3A !important; color: #888 !important; }
  body.dark-mode .skeleton-card { background: #2A2A2A !important; }
  body.dark-mode .loading-grid .skeleton-poster { background: #333 !important; }
  body.dark-mode .browse-title { color: #C8713A !important; }

  /* My List */
  body.dark-mode .wl-page-label { color: #C8713A !important; }
  body.dark-mode .wl-page-title { color: #F0EDE8 !important; }
  body.dark-mode .wl-stat-card { background: #1E1E1E !important; border-color: #2A2A2A !important; }
  body.dark-mode .wl-stat-value { color: #F0EDE8 !important; }
  body.dark-mode .wl-stat-label { color: #666 !important; }
  body.dark-mode .wl-genre-bar { background: #1E1E1E !important; border-color: #2A2A2A !important; }
  body.dark-mode .wl-genre-name { color: #C0BAB4 !important; }
  body.dark-mode .wl-genre-track { background: #2A2A2A !important; }
  body.dark-mode .wl-tab { border-color: #3A3A3A !important; color: #888 !important; background: transparent !important; }
  body.dark-mode .wl-tab.active { background: #F0EDE8 !important; border-color: #F0EDE8 !important; color: #141414 !important; }
  body.dark-mode .wl-meta { color: #666 !important; }
  body.dark-mode .wl-share-btn { border-color: #3A3A3A !important; color: #888 !important; }
  body.dark-mode .wl-modal { background: #1E1E1E !important; }
  body.dark-mode .wl-modal-title { color: #F0EDE8 !important; }
  body.dark-mode .wl-modal-list { background: #2A2A2A !important; border-color: #3A3A3A !important; color: #C0BAB4 !important; }

  /* Picks / Recommendations */
  body.dark-mode .rp-page-label { color: #C8713A !important; }
  body.dark-mode .rp-page-title { color: #F0EDE8 !important; }
  body.dark-mode .rp-page-sub { color: #666 !important; }
  body.dark-mode .rp-filter-pill { border-color: #3A3A3A !important; color: #888 !important; background: transparent !important; }
  body.dark-mode .rp-filter-pill.active { background: #F0EDE8 !important; border-color: #F0EDE8 !important; color: #141414 !important; }
  body.dark-mode .lb-card { background: #1E1E1E !important; border-color: #2A2A2A !important; }
  body.dark-mode .lb-section-title { color: #F0EDE8 !important; }
  body.dark-mode .lb-section-sub { color: #666 !important; }
  body.dark-mode .lb-name { color: #C0BAB4 !important; }
  body.dark-mode .lb-media-title { color: #C0BAB4 !important; }
  body.dark-mode .lb-media-meta { color: #555 !important; }
  body.dark-mode .lb-row { border-bottom-color: #2A2A2A !important; }
  body.dark-mode .lb-media-row { border-bottom-color: #2A2A2A !important; }

  /* Hidden Gems */
  body.dark-mode .hg-label { color: #C8713A !important; }
  body.dark-mode .hg-title { color: #F0EDE8 !important; }
  body.dark-mode .hg-sub { color: #666 !important; }
  body.dark-mode .hg-meta { color: #666 !important; }
  body.dark-mode .hg-chip { background: #1E1E1E !important; border-color: #2A2A2A !important; color: #888 !important; }
  body.dark-mode .hg-skeleton { background: #2A2A2A !important; }

  /* SQL Explorer */
  body.dark-mode .sql-sidebar { background: #1A1A1A !important; border-right-color: #2A2A2A !important; }
  body.dark-mode .sql-sidebar-section { color: #555 !important; }
  body.dark-mode .sql-query-item { border-bottom-color: #222 !important; }
  body.dark-mode .sql-query-item:hover { background: #242424 !important; }
  body.dark-mode .sql-query-item.active { background: #2A1A10 !important; border-left-color: #C8713A !important; }
  body.dark-mode .sql-query-title { color: #C0BAB4 !important; }
  body.dark-mode .sql-query-preview { color: #444 !important; }
  body.dark-mode .sql-quick-bar { background: #1A1A1A !important; border-bottom-color: #2A2A2A !important; }
  body.dark-mode .sql-quick-btn { border-color: #3A3A3A !important; color: #888 !important; }
  body.dark-mode .sql-quick-btn:hover { border-color: #C8713A !important; color: #C8713A !important; background: #1A0F08 !important; }
  body.dark-mode .sql-editor-wrap { background: #1A1A1A !important; border-bottom-color: #2A2A2A !important; }
  body.dark-mode .sql-editor-label { color: #F0EDE8 !important; }
  body.dark-mode .sql-shortcut { background: #2A2A2A !important; color: #666 !important; }
  body.dark-mode .sql-select-badge { background: #2A2A2A !important; color: #666 !important; }
  body.dark-mode .sql-textarea { background: #141414 !important; border-color: #3A3A3A !important; color: #C0BAB4 !important; }
  body.dark-mode .sql-title-input { background: #2A2A2A !important; border-color: #3A3A3A !important; color: #F0EDE8 !important; }
  body.dark-mode .sql-save-btn { border-color: #3A3A3A !important; color: #888 !important; }
  body.dark-mode .sql-results { background: #141414 !important; }
  body.dark-mode .sql-results-label { color: #F0EDE8 !important; }
  body.dark-mode .sql-table-wrap { background: #1E1E1E !important; border-color: #2A2A2A !important; }
  body.dark-mode .sql-table th { background: #1A1A1A !important; color: #666 !important; border-bottom-color: #2A2A2A !important; }
  body.dark-mode .sql-table td { color: #C0BAB4 !important; border-bottom-color: #222 !important; }
  body.dark-mode .sql-table tr:hover td { background: #242424 !important; }
  body.dark-mode .sql-empty-state { color: #444 !important; }
  body.dark-mode .sql-error { background: #1A0F08 !important; border-color: #3A2010 !important; color: #C8713A !important; }

  /* Admin */
  body.dark-mode .adm-tabs { background: #1A1A1A !important; border-bottom-color: #2A2A2A !important; }
  body.dark-mode .adm-tab { color: #666 !important; }
  body.dark-mode .adm-tab.active { color: #F0EDE8 !important; border-bottom-color: #C8713A !important; }
  body.dark-mode .adm-sidebar { background: #1A1A1A !important; border-right-color: #2A2A2A !important; }
  body.dark-mode .adm-sidebar-header { border-bottom-color: #2A2A2A !important; }
  body.dark-mode .adm-search { background: #2A2A2A !important; border-color: #3A3A3A !important; color: #F0EDE8 !important; }
  body.dark-mode .adm-list-item:hover { background: #242424 !important; }
  body.dark-mode .adm-list-item.active { background: #2A1A10 !important; border-left-color: #C8713A !important; }
  body.dark-mode .adm-list-title { color: #C0BAB4 !important; }
  body.dark-mode .adm-list-meta { color: #555 !important; }
  body.dark-mode .adm-overview { background: #141414 !important; }
  body.dark-mode .adm-overview-title { color: #F0EDE8 !important; }
  body.dark-mode .adm-overview-label { color: #C8713A !important; }
  body.dark-mode .adm-overview-pill { border-color: #3A3A3A !important; color: #888 !important; background: transparent !important; }
  body.dark-mode .adm-overview-pill.active { background: #F0EDE8 !important; border-color: #F0EDE8 !important; color: #141414 !important; }
  body.dark-mode .adm-overview-search { background: #2A2A2A !important; border-color: #3A3A3A !important; color: #F0EDE8 !important; }
  body.dark-mode .adm-grid-card, body.dark-mode .adm-person-card { background: #1E1E1E !important; border-color: #2A2A2A !important; }
  body.dark-mode .adm-grid-title { color: #F0EDE8 !important; }
  body.dark-mode .adm-grid-meta { color: #555 !important; }
  body.dark-mode .adm-person-name { color: #F0EDE8 !important; }
  body.dark-mode .adm-person-meta { color: #555 !important; }
  body.dark-mode .adm-add-new-card { border-color: #3A3A3A !important; color: #555 !important; }
  body.dark-mode .adm-add-new-card:hover { border-color: #C8713A !important; color: #C8713A !important; background: #1A0F08 !important; }
  body.dark-mode .adm-panel { background: #141414 !important; }
  body.dark-mode .adm-panel-label { color: #C8713A !important; }
  body.dark-mode .adm-panel-title { color: #F0EDE8 !important; }
  body.dark-mode .adm-close-btn { background: #2A2A2A !important; color: #888 !important; }
  body.dark-mode .adm-form-card { background: #1E1E1E !important; border-color: #2A2A2A !important; }
  body.dark-mode .adm-form-card-title { color: #555 !important; }
  body.dark-mode .adm-field label { color: #666 !important; }
  body.dark-mode .adm-field input, body.dark-mode .adm-field select, body.dark-mode .adm-field textarea { background: #2A2A2A !important; border-color: #3A3A3A !important; color: #F0EDE8 !important; }
  body.dark-mode .adm-season-card { background: #1E1E1E !important; border-color: #2A2A2A !important; }
  body.dark-mode .adm-season-header { background: #242424 !important; }
  body.dark-mode .adm-credit-item { background: #2A2A2A !important; border-color: #3A3A3A !important; }

  /* Inputs globally */
  body.dark-mode textarea,
  body.dark-mode input[type="text"],
  body.dark-mode input[type="email"],
  body.dark-mode input[type="password"],
  body.dark-mode input[type="number"] {
    background: #2A2A2A !important;
    color: #F0EDE8 !important;
    border-color: #3A3A3A !important;
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
