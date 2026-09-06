import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';

export default function AdminAuditLogs() {
  const [rows, setRows] = useState(null);

  useEffect(() => { adminApi.auditLogs().then(({ data }) => setRows(data.data)); }, []);

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <h1 style={{ fontSize: '1.8rem' }}>Audit logs</h1>

      {!rows && <div className="skeleton" style={{ height: 300, marginTop: 16 }} />}
      {rows && rows.length === 0 && <div className="empty-state">No audit activity yet.</div>}

      {rows && rows.length > 0 && (
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table className="data-table">
            <thead><tr><th>Action</th><th>Entity</th><th>Actor</th><th>When</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.action}</td>
                  <td>{r.entity_type} #{r.entity_id}</td>
                  <td>{r.actor_name || 'System'}</td>
                  <td>{new Date(r.created_at).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
