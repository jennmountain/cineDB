import React, { useState } from 'react'
import supabase from '../config/supabaseClient'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .auth-root {
    min-height: 100vh;
    background: #F8F6F2;
    display: flex;
    font-family: 'DM Sans', sans-serif;
  }

  .auth-left {
    flex: 1;
    background: #1C1C1A;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px;
    min-height: 100vh;
  }

  .auth-left-logo {
    font-family: 'DM Serif Display', serif;
    font-size: 24px;
    color: #F8F6F2;
    letter-spacing: -0.02em;
  }

  .auth-left-logo span {
    color: #B5622A;
  }

  .auth-left-tagline {
    color: #F8F6F2;
  }

  .auth-left-title {
    font-family: 'DM Serif Display', serif;
    font-size: 42px;
    font-weight: 400;
    line-height: 1.15;
    margin-bottom: 16px;
    color: #F8F6F2;
  }

  .auth-left-title em {
    color: #B5622A;
    font-style: italic;
  }

  .auth-left-sub {
    font-size: 14px;
    color: #9A9390;
    line-height: 1.6;
    max-width: 320px;
  }

  .auth-left-footer {
    font-size: 11px;
    color: #4A4440;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .auth-right {
    width: 460px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 40px;
  }

  .auth-form-wrap {
    width: 100%;
    max-width: 360px;
  }

  .auth-form-label {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #B5622A;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .auth-form-title {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    color: #1C1C1A;
    font-weight: 400;
    margin-bottom: 28px;
  }

  .auth-field {
    margin-bottom: 16px;
  }

  .auth-field label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #6B6660;
    margin-bottom: 6px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .auth-field input {
    width: 100%;
    border: 1.5px solid #D4C9BA;
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 14px;
    outline: none;
    background: #fff;
    font-family: 'DM Sans', sans-serif;
    color: #1C1C1A;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }

  .auth-field input:focus {
    border-color: #B5622A;
  }

  .auth-field input::placeholder {
    color: #C4BAB0;
  }

  .auth-submit {
    width: 100%;
    background: #1C1C1A;
    color: #F8F6F2;
    border: none;
    border-radius: 10px;
    padding: 13px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 8px;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.04em;
    transition: background 0.15s;
  }

  .auth-submit:hover {
    background: #B5622A;
  }

  .auth-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .auth-switch {
    font-size: 13px;
    color: #9A9390;
    margin-top: 20px;
    text-align: center;
  }

  .auth-switch button {
    background: none;
    border: none;
    color: #B5622A;
    cursor: pointer;
    font-size: 13px;
    padding: 0;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .auth-error {
    background: #FDF0E8;
    border: 1px solid #E8C4A0;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #B5622A;
    margin-bottom: 16px;
  }

  .auth-info {
    background: #EAF3DE;
    border: 1px solid #B8D99A;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #3B6D11;
    margin-bottom: 16px;
  }

  .auth-divider {
    border: none;
    border-top: 1px solid #E4DDD4;
    margin: 24px 0;
  }

  @media (max-width: 700px) {
    .auth-left { display: none; }
    .auth-right { width: 100%; padding: 32px 24px; }
  }
`

export default function AuthPage() {
  const [mode, setMode]         = useState('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [info, setInfo]         = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null); setInfo(null); setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
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

  function switchMode() {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setError(null); setInfo(null)
  }

  return (
    <>
      <style>{styles}</style>
      <div className="auth-root">

        {/* Left panel */}
        <div className="auth-left">
          <div className="auth-left-logo">Cine<span>DB</span></div>

          <div className="auth-left-tagline">
            <div className="auth-left-title">
              Your personal<br /><em>movie database.</em>
            </div>
            <p className="auth-left-sub">
              Track what you've watched, discover what's next, and share your recommendations with the community.
            </p>
          </div>

          <div className="auth-left-footer">CineDB · Built for film lovers</div>
        </div>

        {/* Right panel */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="auth-form-label">
              {mode === 'signin' ? 'Welcome back' : 'Get started'}
            </div>
            <div className="auth-form-title">
              {mode === 'signin' ? 'Sign in to CineDB' : 'Create your account'}
            </div>

            {error && <div className="auth-error">{error}</div>}
            {info  && <div className="auth-info">{info}</div>}

            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="auth-field">
                  <label>Username</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. moviefan42" required />
                </div>
              )}
              <div className="auth-field">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com" required />
              </div>
              <div className="auth-field">
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required />
              </div>

              <button type="submit" disabled={loading} className="auth-submit">
                {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <hr className="auth-divider" />

            <p className="auth-switch">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={switchMode}>
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

      </div>
    </>
  )
}
