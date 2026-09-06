import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';

export default function AdminUpdateRequests() {
  const [rows, setRows] = useState(null);

  function load() {
    adminApi.pendingUpdateRequests().then(({ data }) => setRows(data.data));
  }
  useEffect(() => { load(); }, []);

  async function handleResolve(id, decision) {
    await adminApi.resolveUpdateRequest(id, { decision });
    load();
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <h1 style={{ fontSize: '1.8rem' }}>College update requests</h1>

      {!rows && <div className="skeleton" style={{ height: 300, marginTop: 16 }} />}
      {rows && rows.length === 0 && <div className="empty-state">No update requests pending review.</div>}

      {rows && rows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
          {rows.map((u) => (
            <div key={u.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <strong style={{ textTransform: 'capitalize' }}>{u.entity_type.replace('_', ' ')} update</strong>
                <span className="text-muted">{u.college_name} · submitted by {u.submitted_by}</span>
              </div>
              <pre style={{ background: 'var(--paper-dim)', padding: 12, borderRadius: 6, overflowX: 'auto', fontSize: '0.85rem', marginTop: 10 }}>
                {JSON.stringify(u.payload_json, null, 2)}
              </pre>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => handleResolve(u.id, 'approved')}>Approve</button>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleResolve(u.id, 'rejected')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
