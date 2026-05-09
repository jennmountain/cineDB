import React, { useState, useEffect, useRef } from 'react'
import supabase from '../config/supabaseClient'

const sqlStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .sql-root {
    display: flex;
    height: calc(100vh - 54px);
    font-family: 'DM Sans', sans-serif;
    background: #F8F6F2;
  }

  /* Sidebar */
  .sql-sidebar {
    width: 260px;
    border-right: 1px solid #E4DDD4;
    background: #fff;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sql-sidebar-section {
    padding: 14px 14px 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #C4BAB0;
  }

  .sql-sidebar-section:not(:first-child) {
    border-top: 1px solid #F0EBE4;
    margin-top: 4px;
  }

  .sql-sidebar-list {
    overflow-y: auto;
    flex: 1;
  }

  .sql-query-item {
    padding: 9px 14px;
    cursor: pointer;
    border-bottom: 1px solid #F8F5F2;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    transition: background 0.1s;
  }

  .sql-query-item:hover {
    background: #FBF9F6;
  }

  .sql-query-item.active {
    background: #FDF0E8;
    border-left: 3px solid #B5622A;
    padding-left: 11px;
  }

  .sql-query-title {
    font-size: 12px;
    font-weight: 500;
    color: #1C1C1A;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    text-align: left;
  }

  .sql-query-preview {
    font-size: 10px;
    color: #C4BAB0;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    font-family: 'ui-monospace', monospace;
  }

  .sql-delete-btn {
    background: none;
    border: none;
    color: #D4C9BA;
    cursor: pointer;
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 4px;
    flex-shrink: 0;
    transition: color 0.15s;
  }

  .sql-delete-btn:hover {
    color: #c0392b;
  }

  /* Main */
  .sql-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #F8F6F2;
  }

  /* Quick query buttons */
  .sql-quick-bar {
    padding: 10px 20px;
    border-bottom: 1px solid #E4DDD4;
    background: #fff;
  }

  .sql-quick-bar-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #C4BAB0;
    margin-bottom: 8px;
  }

  .sql-quick-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .sql-quick-btn {
    padding: 7px 18px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 500;
    border: 1.5px solid #D4C9BA;
    background: transparent;
    color: #6B6660;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .sql-quick-btn:hover {
    border-color: #B5622A;
    color: #B5622A;
    background: #FDF0E8;
  }

  /* Editor */
  .sql-editor-wrap {
    padding: 16px 20px 0;
    border-bottom: 1px solid #E4DDD4;
    background: #fff;
    flex-shrink: 0;
  }

  .sql-editor-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .sql-editor-label {
    font-size: 12px;
    font-weight: 600;
    color: #1C1C1A;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sql-shortcut {
    font-size: 10px;
    color: #9A9390;
    background: #F0EBE4;
    padding: 2px 7px;
    border-radius: 4px;
    font-family: 'ui-monospace', monospace;
  }

  .sql-select-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 100px;
    background: #EDE9E3;
    color: #9A9390;
    letter-spacing: 0.04em;
  }

  .sql-textarea {
    width: 100%;
    min-height: 140px;
    border: 1.5px solid #D4C9BA;
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 13px;
    font-family: 'ui-monospace', Menlo, Monaco, monospace;
    outline: none;
    background: #F8F6F2;
    resize: vertical;
    line-height: 1.7;
    color: #1C1C1A;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }

  .sql-textarea:focus {
    border-color: #B5622A;
    background: #fff;
  }

  .sql-action-row {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px 0;
    flex-wrap: wrap;
  }

  .sql-run-btn {
    background: #1C1C1A;
    color: #F8F6F2;
    border: none;
    border-radius: 100px;
    padding: 9px 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.04em;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sql-run-btn:hover:not(:disabled) {
    background: #B5622A;
  }

  .sql-run-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .sql-divider {
    width: 1px;
    height: 20px;
    background: #E4DDD4;
    margin: 0 2px;
  }

  .sql-title-input {
    border: 1.5px solid #D4C9BA;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    outline: none;
    width: 160px;
    font-family: 'DM Sans', sans-serif;
    color: #1C1C1A;
    background: #F8F6F2;
    transition: border-color 0.15s;
  }

  .sql-title-input:focus {
    border-color: #B5622A;
  }

  .sql-save-btn {
    background: transparent;
    color: #6B6660;
    border: 1.5px solid #D4C9BA;
    border-radius: 100px;
    padding: 8px 16px;
    font-size: 12px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    transition: all 0.15s;
  }

  .sql-save-btn:hover:not(:disabled) {
    border-color: #B5622A;
    color: #B5622A;
  }

  /* Results */
  .sql-results {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .sql-results-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .sql-results-label {
    font-size: 13px;
    font-weight: 600;
    color: #1C1C1A;
  }

  .sql-row-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 100px;
    background: #EAF3DE;
    color: #3B6D11;
  }

  .sql-table-wrap {
    overflow-x: auto;
    border: 1px solid #E4DDD4;
    border-radius: 12px;
    background: #fff;
  }

  .sql-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .sql-table th {
    padding: 10px 14px;
    text-align: left;
    font-weight: 600;
    font-size: 11px;
    color: #9A9390;
    border-bottom: 1px solid #E4DDD4;
    white-space: nowrap;
    text-align: left;
    background: #F8F6F2;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .sql-table td {
    padding: 10px 14px;
    border-bottom: 1px solid #F5F0EB;
    color: #1C1C1A;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    text-align: center;
  }

  .sql-table tr:last-child td {
    border-bottom: none;
  }

  .sql-table tr:hover td {
    background: #FBF9F6;
  }

  .sql-null {
    color: #C4BAB0;
    font-style: italic;
    font-size: 12px;
  }

  .sql-bool-true  { color: #3B6D11; font-weight: 500; }
  .sql-bool-false { color: #c0392b; font-weight: 500; }

  .sql-error {
    background: #FDF0E8;
    border: 1px solid #E8C4A0;
    border-radius: 10px;
    padding: 14px 16px;
    font-size: 13px;
    color: #B5622A;
    font-family: 'ui-monospace', monospace;
    white-space: pre-wrap;
    line-height: 1.5;
  }

  .sql-empty-state {
    text-align: center;
    padding: 60px 0;
    color: #C4BAB0;
  }

  .sql-empty-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .sql-empty-text {
    font-size: 13px;
  }

  .sql-msg-success { font-size: 12px; color: #3B6D11; }
  .sql-msg-error   { font-size: 12px; color: #c0392b; }
`

export default function SqlPage({ session, profile }) {
  const [queries,     setQueries]     = useState([])
  const [quickQueries, setQuickQueries] = useState([])
  const [sql,         setSql]         = useState('')
  const [title,       setTitle]       = useState('')
  const [results,     setResults]     = useState(null)
  const [columns,     setColumns]     = useState([])
  const [running,     setRunning]     = useState(false)
  const [error,       setError]       = useState(null)
  const [saveError,   setSaveError]   = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [activeId,    setActiveId]    = useState(null)
  const textareaRef = useRef()

  useEffect(() => { fetchQueries(); fetchQuickQueries() }, [])

  async function fetchQueries() {
    const { data } = await supabase
      .from('saved_queries')
      .select('*')
      .or(`is_default.eq.true,user_id.eq.${session.user.id}`)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })
    setQueries(data || [])
  }

  async function fetchQuickQueries() {
    const { data } = await supabase
      .from('saved_queries')
      .select('id, title, sql')
      .eq('is_quick', true)
      .order('title', { ascending: true })
    setQuickQueries(data || [])
  }

  function selectQuery(q) {
    setSql(q.sql); setTitle(q.is_default ? '' : q.title); setActiveId(q.id)
    setResults(null); setColumns([]); setError(null); setSaveError(null); setSaveSuccess(null)
  }

  function loadQuick(q) {
    setSql(q.sql); setTitle(''); setActiveId(null)
    setResults(null); setColumns([]); setError(null)
  }

  async function runQuery() {
    const trimmed = sql.trim()
    if (!trimmed) return
    setRunning(true); setError(null); setResults(null); setColumns([])
    if (!/^select\s/i.test(trimmed)) {
      setError('Only SELECT queries are allowed in the explorer.')
      setRunning(false); return
    }
    const { data, error } = await supabase.rpc('run_query', { query_text: trimmed })
    if (error) {
      setError('Query failed: ' + error.message + '\n\nMake sure the run_query RPC function is created in Supabase.')
    } else if (data && data.length > 0) {
      setColumns(Object.keys(data[0])); setResults(data)
    } else {
      setColumns([]); setResults([])
    }
    setRunning(false)
  }

  async function saveQuery() {
    const trimmed = sql.trim(); const trimTitle = title.trim()
    if (!trimmed)   { setSaveError('Write a query first.'); return }
    if (!trimTitle) { setSaveError('Give your query a title.'); return }
    setSaving(true); setSaveError(null); setSaveSuccess(null)
    const { error } = await supabase.from('saved_queries').insert([{
      user_id: session.user.id, title: trimTitle, sql: trimmed, is_default: false,
    }])
    if (error) setSaveError(error.message)
    else { setSaveSuccess('Saved!'); setTitle(''); fetchQueries() }
    setSaving(false)
  }

  async function deleteQuery(id, e) {
    e.stopPropagation()
    if (!window.confirm('Delete this saved query?')) return
    await supabase.from('saved_queries').delete().eq('id', id).eq('user_id', session.user.id)
    if (activeId === id) { setSql(''); setTitle(''); setResults(null); setColumns([]); setActiveId(null) }
    fetchQueries()
  }

  const handleKeyDown = e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runQuery() }
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart; const end = e.target.selectionEnd
      const newSql = sql.substring(0, start) + '  ' + sql.substring(end)
      setSql(newSql)
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 2 }, 0)
    }
  }

  const myQueries = queries.filter(q => !q.is_default)

  return (
    <>
      <style>{sqlStyles}</style>
      <div className="sql-root">

        {/* Sidebar */}
        <div className="sql-sidebar">
          <div className="sql-sidebar-list">
              {myQueries.length > 0 && (
              <>
                <div className="sql-sidebar-section">My Saved Queries</div>
                {myQueries.map(q => (
                  <QueryItem key={q.id} query={q} active={activeId === q.id}
                    onClick={() => selectQuery(q)} onDelete={e => deleteQuery(q.id, e)} />
                ))}
              </>
            )}
            {myQueries.length === 0 && (
              <div style={{ padding: '20px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>💾</div>
                <p style={{ fontSize: 12, color: '#C4BAB0', lineHeight: 1.5 }}>No saved queries yet.<br/>Run a query and save it.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main */}
        <div className="sql-main">

          {/* Quick query buttons */}
          {quickQueries.length > 0 && (
            <div className="sql-quick-bar">
              <div className="sql-quick-bar-label">Quick queries</div>
              <div className="sql-quick-btns">
                {quickQueries.map(q => (
                  <button key={q.id} className="sql-quick-btn" onClick={() => loadQuick(q)}>
                    {q.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Editor */}
          <div className="sql-editor-wrap">
            <div className="sql-editor-top">
              <div className="sql-editor-label">
                SQL Editor
                <span className="sql-shortcut">⌘ Enter to run</span>
              </div>
              <span className="sql-select-badge">SELECT only</span>
            </div>
            <textarea
              ref={textareaRef}
              className="sql-textarea"
              value={sql}
              onChange={e => setSql(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={'-- Write a SELECT query or click a quick button above\n-- e.g. SELECT * FROM media LIMIT 10;'}
              spellCheck={false}
            />
            <div className="sql-action-row">
              <button className="sql-run-btn" onClick={runQuery} disabled={running || !sql.trim()}>
                {running ? '⏳ Running…' : '▶ Run'}
              </button>
              <div className="sql-divider" />
              <input className="sql-title-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Query title…" />
              <button className="sql-save-btn" onClick={saveQuery} disabled={saving}>
                {saving ? 'Saving…' : '💾 Save query'}
              </button>
              {saveError   && <span className="sql-msg-error">{saveError}</span>}
              {saveSuccess && <span className="sql-msg-success">{saveSuccess}</span>}
            </div>
          </div>

          {/* Results */}
          <div className="sql-results">
            {error && <div className="sql-error">{error}</div>}

            {results !== null && !error && (
              <>
                <div className="sql-results-header">
                  <span className="sql-results-label">Results</span>
                  <span className="sql-row-badge">{results.length} row{results.length !== 1 ? 's' : ''}</span>
                </div>
                {results.length === 0
                  ? <p style={{ fontSize: 13, color: '#9A9390' }}>Query returned no rows.</p>
                  : (
                    <div className="sql-table-wrap">
                      <table className="sql-table">
                        <thead>
                          <tr>{columns.map(col => <th key={col}>{col}</th>)}</tr>
                        </thead>
                        <tbody>
                          {results.map((row, i) => (
                            <tr key={i}>
                              {columns.map(col => (
                                <td key={col}>
                                  {row[col] === null
                                    ? <span className="sql-null">null</span>
                                    : typeof row[col] === 'boolean'
                                      ? <span className={row[col] ? 'sql-bool-true' : 'sql-bool-false'}>{String(row[col])}</span>
                                      : String(row[col])
                                  }
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                }
              </>
            )}

            {results === null && !error && !running && (
              <div className="sql-empty-state">
                <div className="sql-empty-icon">⌨️</div>
                <div className="sql-empty-text">Click a quick button or write a query above</div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}

function QueryItem({ query, active, onClick, onDelete }) {
  return (
    <div className={`sql-query-item${active ? ' active' : ''}`} onClick={onClick}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="sql-query-title" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{query.title}</div>
        <div className="sql-query-preview">{query.sql.trim().split('\n')[0].slice(0, 45)}…</div>
      </div>
      {onDelete && (
        <button className="sql-delete-btn" onClick={onDelete} title="Delete">✕</button>
      )}
    </div>
  )
}
