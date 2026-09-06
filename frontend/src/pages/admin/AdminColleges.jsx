import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';
import VerifiedBadge from '../../components/VerifiedBadge.jsx';

const STATUS_OPTIONS = ['verified', 'needs_verification', 'reported', 'outdated'];

export default function AdminColleges() {
  const [rows, setRows] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  function load() {
    adminApi.listColleges({ status: statusFilter || undefined }).then(({ data }) => setRows(data.data));
  }
  useEffect(() => { load(); }, [statusFilter]);

  async function handleVerify(collegeId, status, publish) {
    await adminApi.verifyCollege(collegeId, { status, publish, note: `Set to ${status} by admin` });
    load();
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <h1 style={{ fontSize: '1.8rem' }}>Manage colleges</h1>

      <select className="input" style={{ width: 220, margin: '16px 0' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
      </select>

      {!rows && <div className="skeleton" style={{ height: 300 }} />}
      {rows && rows.length === 0 && <div className="empty-state">No colleges match this filter.</div>}

      {rows && rows.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Status</th><th>Published</th><th>Demo</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td><VerifiedBadge status={c.verification_status} lastVerifiedAt={c.last_verified_at} /></td>
                  <td>{c.is_published ? 'Yes' : 'No'}</td>
                  <td>{c.is_demo ? 'Demo' : '—'}</td>
                  <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => handleVerify(c.id, 'verified', true)}>Verify &amp; publish</button>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleVerify(c.id, 'needs_verification', false)}>Needs verification</button>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleVerify(c.id, 'outdated', c.is_published)}>Mark outdated</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
