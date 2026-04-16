import React, { useState } from 'react'
import supabase from '../config/supabaseClient'

export default function AuthPage() {
  const [mode, setMode]       = useState('signin')  // signin | signup
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [info, setInfo]       = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      })
      if (error) setError(error.message)
      else setInfo('Account created! You can now sign in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f7f5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 16px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{
            background: '#F5C518', color: '#111', fontWeight: 700,
            fontSize: 22, padding: '4px 12px', borderRadius: 6,
          }}>CineDB</span>
          <p style={{ color: '#888', fontSize: 13, marginTop: 10 }}>Your personal movie database</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '0.5px solid #eee' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20 }}>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </h2>

          {error && <div style={s.errorBox}>{error}</div>}
          {info  && <div style={s.infoBox}>{info}</div>}

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <Field label="Username" type="text" value={username}
                onChange={e => setUsername(e.target.value)} placeholder="e.g. moviefan42" required />
            )}
            <Field label="Email" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
            <Field label="Password" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />

            <button type="submit" disabled={loading} style={s.submitBtn}>
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p style={{ fontSize: 13, color: '#888', marginTop: 16, textAlign: 'center' }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null) }}
              style={{ background: 'none', border: 'none', color: '#185FA5', cursor: 'pointer', fontSize: 13, padding: 0 }}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#666', fontWeight: 500, marginBottom: 4 }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        style={{
          width: '100%', border: '0.5px solid #ddd', borderRadius: 8,
          padding: '9px 12px', fontSize: 13, outline: 'none', background: '#fafafa',
        }}
      />
    </div>
  )
}

const s = {
  submitBtn: {
    width: '100%', background: '#111', color: '#fff', border: 'none',
    borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', marginTop: 4,
  },
  errorBox: {
    background: '#fff0f0', border: '0.5px solid #f5c6c6', borderRadius: 8,
    padding: '10px 12px', fontSize: 13, color: '#c0392b', marginBottom: 14,
  },
  infoBox: {
    background: '#f0f7ff', border: '0.5px solid #b5d4f4', borderRadius: 8,
    padding: '10px 12px', fontSize: 13, color: '#185FA5', marginBottom: 14,
  },
}
