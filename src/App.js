import React, { useState, useEffect } from 'react'
import supabase from './config/supabaseClient'

import AuthPage from './components/AuthPage'
import BrowsePage from './components/BrowsePage'
import DetailPage from './components/DetailPage'
import PersonPage from './components/PersonPage'
import WatchlistPage from './components/WatchlistPage'
import AdminPage from './components/AdminPage'
import SqlPage from './components/SqlPage'
import Navbar from './components/Navbar'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [page, setPage]       = useState('browse')   // browse | detail | person | watchlist | admin | sql
  const [detailId, setDetailId] = useState(null)
  const [personId, setPersonId] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

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
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: '#888', fontSize: 14 }}>Loading…</p>
      </div>
    )
  }

  if (!session) {
    return <AuthPage onAuth={() => {}} />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f5' }}>
      <Navbar
        profile={profile}
        currentPage={page}
        navigate={navigate}
        onSignOut={async () => { await supabase.auth.signOut(); setPage('browse') }}
      />

      <div style={{ paddingTop: 54 }}>
        {page === 'browse' && (
          <BrowsePage navigate={navigate} session={session} profile={profile} />
        )}
        {page === 'detail' && (
          <DetailPage mediaId={detailId} navigate={navigate} session={session} profile={profile} />
        )}
        {page === 'person' && (
          <PersonPage personId={personId} navigate={navigate} />
        )}
        {page === 'watchlist' && (
          <WatchlistPage navigate={navigate} session={session} profile={profile} />
        )}
        {page === 'admin' && profile?.is_admin && (
          <AdminPage navigate={navigate} session={session} profile={profile} />
        )}
        {page === 'sql' && (
          <SqlPage session={session} profile={profile} />
        )}
      </div>
    </div>
  )
}
