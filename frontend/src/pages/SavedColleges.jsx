import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../api/endpoints';

export default function SavedColleges() {
  const [rows, setRows] = useState(null);

  function load() {
    userApi.savedColleges().then(({ data }) => setRows(data.data));
  }
  useEffect(() => { load(); }, []);

  async function handleRemove(collegeId) {
    await userApi.unsaveCollege(collegeId);
    load();
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <h1 style={{ fontSize: '1.8rem' }}>Saved colleges</h1>

      {!rows && <div className="skeleton" style={{ height: 200, marginTop: 20 }} />}

      {rows && rows.length === 0 && (
        <div className="empty-state">
          <h3>No saved colleges yet</h3>
          <p className="text-muted">Save colleges while browsing to keep track of your shortlist.</p>
          <Link to="/search" className="btn btn-primary">Search colleges</Link>
        </div>
      )}

      {rows && rows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
          {rows.map((c) => (
            <div key={c.id} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Link to={`/colleges/${c.slug}`}><strong>{c.name}</strong></Link>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>{c.city}, {c.state}</p>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleRemove(c.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
