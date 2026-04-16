import React, { useState, useEffect, useRef } from 'react'
import supabase from '../config/supabaseClient'

export default function SqlPage({ session, profile }) {
  const [queries, setQueries]       = useState([])
  const [sql, setSql]               = useState('')
  const [title, setTitle]           = useState('')
  const [results, setResults]       = useState(null)
  const [columns, setColumns]       = useState([])
  const [running, setRunning]       = useState(false)
  const [error, setError]           = useState(null)
  const [saveError, setSaveError]   = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [activeId, setActiveId]     = useState(null)
  const textareaRef = useRef()

  useEffect(() => { fetchQueries() }, [])

  async function fetchQueries() {
    const { data } = await supabase
      .from('saved_queries')
      .select('*')
      .or(`is_default.eq.true,user_id.eq.${session.user.id}`)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })
    setQueries(data || [])
  }

  function selectQuery(q) {
    setSql(q.sql)
    setTitle(q.is_default ? '' : q.title)
    setActiveId(q.id)
    setResults(null)
    setColumns([])
    setError(null)
    setSaveError(null)
    setSaveSuccess(null)
  }

  async function runQuery() {
    const trimmed = sql.trim()
    if (!trimmed) return
    setRunning(true)
    setError(null)
    setResults(null)
    setColumns([])

    // Only allow SELECT for safety
    if (!/^select\s/i.test(trimmed)) {
      setError('Only SELECT queries are allowed in the explorer.')
      setRunning(false)
      return
    }

    const { data, error } = await supabase.rpc('run_query', { query_text: trimmed })

    if (error) {
      // Fallback: try executing via direct table queries if RPC not set up
      setError(
        'Query failed: ' + error.message +
        '\n\nNote: Make sure the run_query RPC function is created in Supabase. See README.'
      )
    } else if (data && data.length > 0) {
      setColumns(Object.keys(data[0]))
      setResults(data)
    } else {
      setColumns([])
      setResults([])
    }
    setRunning(false)
  }

  async function saveQuery() {
    const trimmed = sql.trim()
    const trimTitle = title.trim()
    if (!trimmed)    { setSaveError('Write a query first.'); return }
    if (!trimTitle)  { setSaveError('Give your query a title.'); return }

    setSaving(true)
    setSaveError(null)
    setSaveSuccess(null)

    const { error } = await supabase.from('saved_queries').insert([{
      user_id: session.user.id,
      title: trimTitle,
      sql: trimmed,
      is_default: false,
    }])

    if (error) setSaveError(error.message)
    else {
      setSaveSuccess('Query saved!')
      setTitle('')
      fetchQueries()
    }
    setSaving(false)
  }

  async function deleteQuery(id, e) {
    e.stopPropagation()
    if (!window.confirm('Delete this saved query?')) return
    await supabase.from('saved_queries').delete().eq('id', id).eq('user_id', session.user.id)
    if (activeId === id) { setSql(''); setTitle(''); setResults(null); setColumns([]); setActiveId(null) }
    fetchQueries()
  }

  const defaultQueries = queries.filter(q => q.is_default)
  const myQueries      = queries.filter(q => !q.is_default)

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      runQuery()
    }
    // Tab inserts spaces instead of changing focus
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end   = e.target.selectionEnd
      const newSql = sql.substring(0, start) + '  ' + sql.substring(end)
      setSql(newSql)
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 2 }, 0)
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 54px)' }}>

      {/* Sidebar */}
      <div style={{
        width: 260, borderRight: '0.5px solid #eee', overflowY: 'auto',
        background: '#fff', flexShrink: 0,
      }}>
        <div style={{ padding: '16px 16px 8px', borderBottom: '0.5px solid #f0f0f0' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#aaa', letterSpacing: 0.5, textTransform: 'uppercase' }}>Default queries</p>
        </div>
        {defaultQueries.map(q => (
          <QueryItem
            key={q.id}
            query={q}
            active={activeId === q.id}
            onClick={() => selectQuery(q)}
          />
        ))}

        <div style={{ padding: '16px 16px 8px', borderBottom: '0.5px solid #f0f0f0', borderTop: '0.5px solid #f0f0f0', marginTop: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#aaa', letterSpacing: 0.5, textTransform: 'uppercase' }}>My queries</p>
        </div>
        {myQueries.length === 0 && (
          <p style={{ padding: '12px 16px', fontSize: 12, color: '#bbb' }}>None saved yet</p>
        )}
        {myQueries.map(q => (
          <QueryItem
            key={q.id}
            query={q}
            active={activeId === q.id}
            onClick={() => selectQuery(q)}
            onDelete={e => deleteQuery(q.id, e)}
          />
        ))}
      </div>

      {/* Main editor area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Editor */}
        <div style={{ padding: '20px 24px 0', borderBottom: '0.5px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>SQL Editor</span>
              <span style={{ fontSize: 11, color: '#aaa' }}>Ctrl+Enter to run</span>
            </div>
            <span style={{
              background: '#EEEDFE', color: '#3C3489',
              fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 500,
            }}>
              SELECT only
            </span>
          </div>

          <textarea
            ref={textareaRef}
            value={sql}
            onChange={e => setSql(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={'-- Write a SELECT query\n-- e.g. SELECT * FROM media LIMIT 10;'}
            spellCheck={false}
            style={{
              width: '100%', minHeight: 160, border: '0.5px solid #ddd', borderRadius: 8,
              padding: '12px 14px', fontSize: 13, fontFamily: 'ui-monospace, Menlo, Monaco, monospace',
              outline: 'none', background: '#fafafa', resize: 'vertical', lineHeight: 1.6,
              color: '#111',
            }}
          />

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 0' }}>
            <button onClick={runQuery} disabled={running || !sql.trim()} style={{
              background: '#111', color: '#fff', border: 'none', borderRadius: 8,
              padding: '8px 18px', fontSize: 13, fontWeight: 500,
              cursor: running || !sql.trim() ? 'not-allowed' : 'pointer',
              opacity: !sql.trim() ? 0.4 : 1,
            }}>
              {running ? 'Running…' : '▶ Run'}
            </button>

            <div style={{ width: 1, height: 20, background: '#eee', margin: '0 4px' }} />

            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Query title…"
              style={{
                border: '0.5px solid #ddd', borderRadius: 8, padding: '8px 12px',
                fontSize: 13, outline: 'none', width: 180,
              }}
            />
            <button onClick={saveQuery} disabled={saving} style={{
              background: '#fff', color: '#111', border: '0.5px solid #ddd',
              borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer',
            }}>
              {saving ? 'Saving…' : 'Save query'}
            </button>

            {saveError   && <span style={{ fontSize: 12, color: '#c0392b' }}>{saveError}</span>}
            {saveSuccess && <span style={{ fontSize: 12, color: '#0F6E56' }}>{saveSuccess}</span>}
          </div>
        </div>

        {/* Results area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {error && (
            <div style={{
              background: '#fff0f0', border: '0.5px solid #f5c6c6', borderRadius: 8,
              padding: '12px 16px', fontSize: 13, color: '#c0392b',
              fontFamily: 'ui-monospace, monospace', whiteSpace: 'pre-wrap', lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          {results !== null && !error && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Results</span>
                <span style={{
                  background: '#EAF3DE', color: '#27500A',
                  fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 500,
                }}>
                  {results.length} row{results.length !== 1 ? 's' : ''}
                </span>
              </div>

              {results.length === 0 ? (
                <p style={{ fontSize: 13, color: '#aaa' }}>Query returned no rows.</p>
              ) : (
                <div style={{ overflowX: 'auto', border: '0.5px solid #eee', borderRadius: 10 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f7f7f5' }}>
                        {columns.map(col => (
                          <th key={col} style={{
                            padding: '10px 14px', textAlign: 'left', fontWeight: 600,
                            fontSize: 12, color: '#555', borderBottom: '0.5px solid #eee',
                            whiteSpace: 'nowrap',
                          }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafaf9' }}>
                          {columns.map(col => (
                            <td key={col} style={{
                              padding: '9px 14px', borderBottom: '0.5px solid #f5f5f5',
                              color: '#333', maxWidth: 300,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {row[col] === null
                                ? <span style={{ color: '#ccc', fontStyle: 'italic' }}>null</span>
                                : typeof row[col] === 'boolean'
                                  ? <span style={{ color: row[col] ? '#0F6E56' : '#c0392b' }}>{String(row[col])}</span>
                                  : String(row[col])
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {results === null && !error && !running && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⌨️</div>
              <p style={{ fontSize: 13 }}>Run a query to see results here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QueryItem({ query, active, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 16px', cursor: 'pointer', borderBottom: '0.5px solid #f8f8f8',
        background: active ? '#f0f0ee' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {query.title}
        </div>
        <div style={{
          fontSize: 11, color: '#aaa', marginTop: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: 'ui-monospace, monospace',
        }}>
          {query.sql.slice(0, 40)}…
        </div>
      </div>
      {onDelete && (
        <button
          onClick={onDelete}
          style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer', fontSize: 14, padding: 2, flexShrink: 0 }}
          title="Delete"
        >✕</button>
      )}
    </div>
  )
}
