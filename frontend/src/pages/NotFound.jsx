import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container empty-state" style={{ paddingTop: 96, paddingBottom: 96 }}>
      <h1 style={{ fontSize: '3rem', color: 'var(--indigo)' }}>404</h1>
      <h2>This page doesn't exist</h2>
      <p className="text-muted">The link might be broken, or the page may have moved.</p>
      <Link to="/" className="btn btn-primary">Back to home</Link>
    </div>
  );
}
