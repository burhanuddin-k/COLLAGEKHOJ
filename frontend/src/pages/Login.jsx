import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      const dest = user.role === 'admin' ? '/admin/dashboard' : user.role === 'college' ? '/college-portal/dashboard' : '/dashboard';
      navigate(dest);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 56, maxWidth: 420, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.7rem', textAlign: 'center' }}>Log in to CollegeKhoj</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 28, marginTop: 20 }}>
        <div className="form-row">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p style={{ color: 'var(--clay)' }}>{error}</p>}
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="text-muted" style={{ textAlign: 'center', marginTop: 16 }}>
        New to CollegeKhoj? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
