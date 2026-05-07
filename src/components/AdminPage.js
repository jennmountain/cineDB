import React, { useState, useEffect, useRef } from 'react'
import supabase from '../config/supabaseClient'

const GENRES    = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Documentary', 'Animation', 'Crime']
const MPA_RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR']
const ROLES     = ['actor', 'director', 'producer', 'writer']
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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('media')

  return (
    <div style={{ height: 'calc(100vh - 54px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', borderBottom: '0.5px solid #eee', background: '#fff', flexShrink: 0 }}>
        {[['media', 'Media'], ['people', 'People']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            padding: '12px 22px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: 'none', border: 'none',
            borderBottom: activeTab === key ? '2px solid #111' : '2px solid transparent',
            color: activeTab === key ? '#111' : '#888',
          }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'media'  && <MediaTab />}
        {activeTab === 'people' && <PeopleTab />}
      </div>
    </div>
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
  const [credits,          setCredits]          = useState([])
  const [allPeople,        setAllPeople]        = useState([])
  const [creditSearch,     setCreditSearch]     = useState('')
  const [creditPersonLocked, setCreditPersonLocked] = useState(false)
  const [creditRole,       setCreditRole]       = useState('actor')
  const [creditCharacter,  setCreditCharacter]  = useState('')
  const [addingCredit,     setAddingCredit]     = useState(false)

  const fileRef = useRef()

  useEffect(() => { fetchMedia() }, [])
  useEffect(() => {
    supabase.from('people').select('id, name').order('name').then(({ data }) => setAllPeople(data || []))
  }, [])

  async function fetchMedia() {
    setLoading(true)
    const { data } = await supabase.from('media').select('*').order('created_at', { ascending: false })
    setMedia(data || [])
    setLoading(false)
  }

  async function fetchCredits(mediaId) {
    const { data } = await supabase
      .from('media_credits')
      .select('id, role, character_name, credit_order, people(id, name)')
      .eq('media_id', mediaId)
      .order('role')
      .order('credit_order')
    setCredits(data || [])
  }

  function openAdd() {
    setSelected(null)
    setForm(EMPTY_MEDIA_FORM)
    setPosterFile(null); setPosterPreview(null)
    setError(null); setSuccess(null)
    setCredits([])
    resetCreditForm()
    setPanelOpen(true)
  }

  function openEdit(item) {
    setSelected(item)
    setForm({
      title:           item.title || '',
      type:            item.type  || 'movie',
      genre:           item.genre || '',
      overview:        item.overview || '',
      release_year:    item.release_year    || '',
      end_year:        item.end_year        || '',
      runtime_minutes: item.runtime_minutes || '',
      mpa_rating:      item.mpa_rating      || '',
      imdb_rating:     item.imdb_rating     || '',
    })
    setPosterFile(null)
    setPosterPreview(getPosterUrl(item.poster_url))
    setError(null); setSuccess(null)
    resetCreditForm()
    fetchCredits(item.id)
    setPanelOpen(true)
  }

  function resetCreditForm() {
    setCreditSearch('')
    setCreditPersonLocked(false)
    setCreditRole('actor')
    setCreditCharacter('')
  }

  function handleFileChange(e) {
    const file = e.target.files[0]; if (!file) return
    setPosterFile(file)
    setPosterPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required.'); return }
    setSaving(true); setError(null); setSuccess(null)

    let poster_url = selected?.poster_url || null
    if (posterFile) {
      const ext  = posterFile.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { data: up, error: ue } = await supabase.storage.from('posters').upload(path, posterFile, { upsert: true })
      if (ue) { setError('Image upload failed: ' + ue.message); setSaving(false); return }
      poster_url = up.path
    }

    const payload = {
      title:           form.title.trim(),
      type:            form.type,
      genre:           form.genre || null,
      overview:        form.overview.trim() || null,
      release_year:    form.release_year    ? parseInt(form.release_year)    : null,
      end_year:        form.end_year        ? parseInt(form.end_year)        : null,
      runtime_minutes: form.runtime_minutes ? parseInt(form.runtime_minutes) : null,
      mpa_rating:      form.mpa_rating      || null,
      imdb_rating:     form.imdb_rating     ? parseFloat(form.imdb_rating)  : null,
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
    if (item.poster_url && !item.poster_url.startsWith('http')) {
      await supabase.storage.from('posters').remove([item.poster_url])
    }
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
      media_id:       selected.id,
      person_id:      person.id,
      role:           creditRole,
      character_name: creditRole === 'actor' && creditCharacter.trim() ? creditCharacter.trim() : null,
      credit_order:   credits.filter(c => c.role === creditRole).length + 1,
    })
    if (e) alert('Error adding credit: ' + e.message)
    else { resetCreditForm(); fetchCredits(selected.id) }
    setAddingCredit(false)
  }

  async function handleRemoveCredit(creditId) {
    await supabase.from('media_credits').delete().eq('id', creditId)
    setCredits(prev => prev.filter(c => c.id !== creditId))
  }

  const set      = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const filtered = media.filter(m => m.title.toLowerCase().includes(search.toLowerCase()))

  const peopleSuggestions = creditSearch.length >= 1 && !creditPersonLocked
    ? allPeople.filter(p => p.name.toLowerCase().includes(creditSearch.toLowerCase())).slice(0, 6)
    : []

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: panelOpen ? 380 : '100%', borderRight: '0.5px solid #eee', display: 'flex', flexDirection: 'column', transition: 'width 0.2s', flexShrink: 0 }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '0.5px solid #eee', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            style={{ flex: 1, border: '0.5px solid #ddd', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none' }} />
          <button onClick={openAdd} style={s.addBtn}>+ Add</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading && <p style={{ padding: 20, color: '#888', fontSize: 13 }}>Loading...</p>}
          {filtered.map(item => (
            <div key={item.id} onClick={() => openEdit(item)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderBottom: '0.5px solid #f5f5f5', cursor: 'pointer',
              background: selected?.id === item.id ? '#f7f7f5' : '#fff',
            }}>
              <div style={{ width: 36, height: 50, borderRadius: 5, overflow: 'hidden', background: '#eee', flexShrink: 0 }}>
                {getPosterUrl(item.poster_url)
                  ? <img src={getPosterUrl(item.poster_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#bbb' }}>-</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                  {item.type === 'movie' ? 'Movie' : 'TV'} · {item.release_year || '-'}
                  {item.mpa_rating && ` · ${item.mpa_rating}`}
                  {item.avg_rating > 0 && ` · * ${item.avg_rating}`}
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); handleDelete(item) }} disabled={deleting}
                style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer', fontSize: 15, padding: 4 }}>x</button>
            </div>
          ))}
          {!loading && filtered.length === 0 && <p style={{ padding: 20, color: '#aaa', fontSize: 13 }}>No results</p>}
        </div>
      </div>

      {panelOpen && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>{selected ? 'Edit media' : 'Add media'}</h2>
            <button onClick={() => setPanelOpen(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 17 }}>x</button>
          </div>

          {error   && <div style={s.errorBox}>{error}</div>}
          {success && <div style={s.successBox}>{success}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Title *</Label>
              <input value={form.title} onChange={set('title')} placeholder="e.g. The Godfather" style={s.input} />
            </div>
            <div>
              <Label>Type</Label>
              <select value={form.type} onChange={set('type')} style={s.input}>
                <option value="movie">Movie</option>
                <option value="tv">TV Series</option>
              </select>
            </div>
            <div>
              <Label>Genre</Label>
              <select value={form.genre} onChange={set('genre')} style={s.input}>
                <option value="">- none -</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <Label>Release year</Label>
              <input type="number" value={form.release_year} onChange={set('release_year')} placeholder="e.g. 1972" style={s.input} min={1888} max={2100} />
            </div>
            {form.type === 'tv' && (
              <div>
                <Label>End year</Label>
                <input type="number" value={form.end_year} onChange={set('end_year')} placeholder="Leave blank if ongoing" style={s.input} min={1888} max={2100} />
              </div>
            )}
            <div>
              <Label>Runtime (minutes)</Label>
              <input type="number" value={form.runtime_minutes} onChange={set('runtime_minutes')} placeholder="e.g. 175" style={s.input} min={1} />
            </div>
            <div>
              <Label>MPA Rating</Label>
              <select value={form.mpa_rating} onChange={set('mpa_rating')} style={s.input}>
                <option value="">- none -</option>
                {MPA_RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <Label>RT Score (%)</Label>
              <input
                type="number"
                value={form.imdb_rating}
                onChange={set('imdb_rating')}
                placeholder="e.g. 94"
                style={s.input}
                min={0}
                max={100}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Overview</Label>
              <textarea value={form.overview} onChange={set('overview')} rows={3} placeholder="Short description..." style={{ ...s.input, resize: 'vertical' }} />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <Label>Poster image</Label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 70, height: 98, borderRadius: 7, overflow: 'hidden', background: '#f0f0ee', flexShrink: 0 }}>
                {posterPreview
                  ? <img src={posterPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#bbb', textAlign: 'center' }}>No<br/>image</div>}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                <button onClick={() => fileRef.current.click()} style={{ border: '0.5px solid #ddd', background: '#fff', borderRadius: 7, padding: '7px 12px', fontSize: 12, cursor: 'pointer' }}>
                  {posterPreview ? 'Change image' : 'Upload image'}
                </button>
                {posterFile && <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{posterFile.name}</p>}
                {posterPreview && !posterFile && (
                  <button onClick={() => { setPosterPreview(null); setPosterFile(null) }}
                    style={{ display: 'block', marginTop: 4, background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: 11, padding: 0 }}>
                    Remove image
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            <button onClick={handleSave} disabled={saving} style={s.primaryBtn}>
              {saving ? 'Saving...' : selected ? 'Save changes' : 'Add media'}
            </button>
            {selected && (
              <button onClick={() => handleDelete(selected)} disabled={deleting} style={s.dangerBtn}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>

          {selected && (
            <div style={{ borderTop: '0.5px solid #eee', paddingTop: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Cast &amp; Crew</h3>
              {credits.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {credits.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, background: '#fafafa', border: '0.5px solid #eee' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 8,
                        background: ROLE_COLORS[c.role].bg, color: ROLE_COLORS[c.role].color,
                        flexShrink: 0,
                      }}>
                        {ROLE_LABELS[c.role]}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{c.people?.name}</span>
                      {c.character_name && <span style={{ fontSize: 11, color: '#888' }}>as {c.character_name}</span>}
                      <button onClick={() => handleRemoveCredit(c.id)}
                        style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 14, padding: '0 2px', flexShrink: 0 }}
                        title="Remove">x</button>
                    </div>
                  ))}
                </div>
              )}
              {credits.length === 0 && <p style={{ fontSize: 12, color: '#aaa', marginBottom: 14 }}>No credits yet.</p>}

              <div style={{ background: '#f9f9f7', border: '0.5px solid #eee', borderRadius: 10, padding: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 10 }}>Add credit</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 8 }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      value={creditSearch}
                      onChange={e => { setCreditSearch(e.target.value); setCreditPersonLocked(false) }}
                      placeholder="Search people..."
                      style={{ ...s.input, fontSize: 12 }}
                    />
                    {peopleSuggestions.length > 0 && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                        background: '#fff', border: '0.5px solid #ddd', borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden',
                      }}>
                        {peopleSuggestions.map(p => (
                          <div key={p.id}
                            onClick={() => { setCreditSearch(p.name); setCreditPersonLocked(true) }}
                            style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                            {p.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <select value={creditRole} onChange={e => setCreditRole(e.target.value)} style={{ ...s.input, fontSize: 12, width: 'auto' }}>
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                {creditRole === 'actor' && (
                  <input
                    value={creditCharacter}
                    onChange={e => setCreditCharacter(e.target.value)}
                    placeholder="Character name (optional)"
                    style={{ ...s.input, fontSize: 12, marginBottom: 8 }}
                  />
                )}
                <button onClick={handleAddCredit} disabled={addingCredit || !creditSearch.trim()} style={{
                  ...s.primaryBtn, fontSize: 12, padding: '7px 14px',
                  opacity: !creditSearch.trim() ? 0.5 : 1,
                }}>
                  {addingCredit ? 'Adding...' : '+ Add credit'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
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
    setSelected(null)
    setForm(EMPTY_PERSON_FORM)
    setPhotoFile(null); setPhotoPreview(null)
    setError(null); setSuccess(null)
    setPanelOpen(true)
  }

  function openEdit(person) {
    setSelected(person)
    setForm({
      name:      person.name      || '',
      bio:       person.bio       || '',
      born_year: person.born_year || '',
      died_year: person.died_year || '',
    })
    setPhotoFile(null)
    setPhotoPreview(getPhotoUrl(person.photo_url))
    setError(null); setSuccess(null)
    setPanelOpen(true)
  }

  function handleFileChange(e) {
    const file = e.target.files[0]; if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError(null); setSuccess(null)

    let photo_url = selected?.photo_url || null
    if (photoFile) {
      const ext  = photoFile.name.split('.').pop()
      const path = `people/${Date.now()}.${ext}`
      const { data: up, error: ue } = await supabase.storage.from('posters').upload(path, photoFile, { upsert: true })
      if (ue) { setError('Photo upload failed: ' + ue.message); setSaving(false); return }
      photo_url = up.path
    }

    const payload = {
      name:      form.name.trim(),
      bio:       form.bio.trim()  || null,
      born_year: form.born_year   ? parseInt(form.born_year) : null,
      died_year: form.died_year   ? parseInt(form.died_year) : null,
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
    if (!window.confirm(`Delete "${person.name}"? This also removes all their credits.`)) return
    setDeleting(true)
    if (person.photo_url && !person.photo_url.startsWith('http')) {
      await supabase.storage.from('posters').remove([person.photo_url])
    }
    await supabase.from('people').delete().eq('id', person.id)
    setPeople(prev => prev.filter(p => p.id !== person.id))
    if (selected?.id === person.id) setPanelOpen(false)
    setDeleting(false)
  }

  const set      = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const filtered = people.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: panelOpen ? 340 : '100%', borderRight: '0.5px solid #eee', display: 'flex', flexDirection: 'column', transition: 'width 0.2s', flexShrink: 0 }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '0.5px solid #eee', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people..."
            style={{ flex: 1, border: '0.5px solid #ddd', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none' }} />
          <button onClick={openAdd} style={s.addBtn}>+ Add</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading && <p style={{ padding: 20, color: '#888', fontSize: 13 }}>Loading...</p>}
          {filtered.map(person => (
            <div key={person.id} onClick={() => openEdit(person)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderBottom: '0.5px solid #f5f5f5', cursor: 'pointer',
              background: selected?.id === person.id ? '#f7f7f5' : '#fff',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: '#eee', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getPhotoUrl(person.photo_url)
                  ? <img src={getPhotoUrl(person.photo_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 16 }}>👤</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.name}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>
                  {person.born_year ? `b. ${person.born_year}` : ''}
                  {person.born_year && person.died_year ? ' - ' : ''}
                  {person.died_year ? `d. ${person.died_year}` : ''}
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); handleDelete(person) }} disabled={deleting}
                style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer', fontSize: 15, padding: 4 }}>x</button>
            </div>
          ))}
          {!loading && filtered.length === 0 && <p style={{ padding: 20, color: '#aaa', fontSize: 13 }}>No results</p>}
        </div>
      </div>

      {panelOpen && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>{selected ? 'Edit person' : 'Add person'}</h2>
            <button onClick={() => setPanelOpen(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 17 }}>x</button>
          </div>

          {error   && <div style={s.errorBox}>{error}</div>}
          {success && <div style={s.successBox}>{success}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Name *</Label>
              <input value={form.name} onChange={set('name')} placeholder="e.g. Christopher Nolan" style={s.input} />
            </div>
            <div>
              <Label>Born year</Label>
              <input type="number" value={form.born_year} onChange={set('born_year')} placeholder="e.g. 1970" style={s.input} min={1800} max={2020} />
            </div>
            <div>
              <Label>Died year</Label>
              <input type="number" value={form.died_year} onChange={set('died_year')} placeholder="Leave blank if alive" style={s.input} min={1800} max={2100} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Bio</Label>
              <textarea value={form.bio} onChange={set('bio')} rows={4} placeholder="Short biography..." style={{ ...s.input, resize: 'vertical' }} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <Label>Photo</Label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: '#f0f0ee', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {photoPreview
                  ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 28 }}>👤</span>}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                <button onClick={() => fileRef.current.click()} style={{ border: '0.5px solid #ddd', background: '#fff', borderRadius: 7, padding: '7px 12px', fontSize: 12, cursor: 'pointer' }}>
                  {photoPreview ? 'Change photo' : 'Upload photo'}
                </button>
                {photoFile && <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{photoFile.name}</p>}
                {photoPreview && !photoFile && (
                  <button onClick={() => { setPhotoPreview(null); setPhotoFile(null) }}
                    style={{ display: 'block', marginTop: 4, background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: 11, padding: 0 }}>
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} disabled={saving} style={s.primaryBtn}>
              {saving ? 'Saving...' : selected ? 'Save changes' : 'Add person'}
            </button>
            {selected && (
              <button onClick={() => handleDelete(selected)} disabled={deleting} style={s.dangerBtn}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Label({ children }) {
  return <label style={{ display: 'block', fontSize: 12, color: '#666', fontWeight: 500, marginBottom: 4 }}>{children}</label>
}

const s = {
  input: {
    width: '100%', border: '0.5px solid #ddd', borderRadius: 8, padding: '8px 10px',
    fontSize: 13, outline: 'none', background: '#fafafa', fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  addBtn: {
    background: '#111', color: '#fff', border: 'none', borderRadius: 8,
    padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  primaryBtn: {
    background: '#111', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
  },
  dangerBtn: {
    background: '#fff8f8', color: '#c0392b', border: '0.5px solid #fcc',
    borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer',
  },
  errorBox: {
    background: '#fff0f0', border: '0.5px solid #f5c6c6', borderRadius: 8,
    padding: '10px 12px', fontSize: 13, color: '#c0392b', marginBottom: 14,
  },
  successBox: {
    background: '#f0faf4', border: '0.5px solid #9fe1cb', borderRadius: 8,
    padding: '10px 12px', fontSize: 13, color: '#0F6E56', marginBottom: 14,
  },
}
