import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardPath = user?.role === 'admin'
    ? '/admin/dashboard'
    : user?.role === 'college'
      ? '/college-portal/dashboard'
      : '/dashboard';

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="nav-brand">
          College<span>Khoj</span>
        </Link>

        <nav className={`nav-links ${open ? 'nav-links-open' : ''}`}>
          <Link to="/search" onClick={() => setOpen(false)}>Colleges</Link>
          <Link to="/courses" onClick={() => setOpen(false)}>Courses</Link>
          <Link to="/compare" onClick={() => setOpen(false)}>Compare</Link>
          <Link to="/find-my-college" onClick={() => setOpen(false)}>Find My College</Link>
          <Link to="/admissions" onClick={() => setOpen(false)}>Admissions</Link>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to={dashboardPath} className="btn btn-ghost btn-sm">Dashboard</Link>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => { logout(); navigate('/'); }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation menu"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </div>
    </header>
  );
}
