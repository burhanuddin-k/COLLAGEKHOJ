import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', role: 'student' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(key, value) { setForm((f) => ({ ...f, [key]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await register(form);
      navigate(user.role === 'college' ? '/college-portal/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 56, maxWidth: 460, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.7rem', textAlign: 'center' }}>Create your account</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 28, marginTop: 20 }}>
        <div className="form-row">
          <label>I am a</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className={`btn btn-sm ${form.role === 'student' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => update('role', 'student')}>Student</button>
            <button type="button" className={`btn btn-sm ${form.role === 'college' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => update('role', 'college')}>College representative</button>
          </div>
        </div>
        <div className="form-row">
          <label htmlFor="fullName">Full name</label>
          <input id="fullName" required className="input" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required className="input" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="phone">Phone (optional)</label>
          <input id="phone" className="input" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={8} className="input" value={form.password} onChange={(e) => update('password', e.target.value)} />
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>At least 8 characters, including a number.</span>
        </div>
        {error && <p style={{ color: 'var(--clay)' }}>{error}</p>}
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="text-muted" style={{ textAlign: 'center', marginTop: 16 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
