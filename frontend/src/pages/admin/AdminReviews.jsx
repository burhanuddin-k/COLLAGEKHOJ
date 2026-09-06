import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';
import RatingStars from '../../components/RatingStars.jsx';

export default function AdminReviews() {
  const [rows, setRows] = useState(null);

  function load() {
    adminApi.pendingReviews().then(({ data }) => setRows(data.data));
  }
  useEffect(() => { load(); }, []);

  async function handleModerate(id, status) {
    await adminApi.moderateReview(id, { status });
    load();
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <h1 style={{ fontSize: '1.8rem' }}>Moderate reviews</h1>

      {!rows && <div className="skeleton" style={{ height: 300, marginTop: 16 }} />}
      {rows && rows.length === 0 && <div className="empty-state">No reviews pending moderation.</div>}

      {rows && rows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
          {rows.map((r) => (
            <div key={r.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <strong>{r.title}</strong>
                <RatingStars value={r.rating_overall} />
              </div>
              <p className="text-muted" style={{ margin: '4px 0 8px', fontSize: '0.85rem' }}>{r.college_name} · by {r.student_name}</p>
              <p>{r.description}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => handleModerate(r.id, 'approved')}>Approve</button>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleModerate(r.id, 'rejected')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
