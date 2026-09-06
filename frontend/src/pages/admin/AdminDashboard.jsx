import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/endpoints';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { adminApi.dashboard().then(({ data: res }) => setData(res.data)); }, []);

  if (!data) return <div className="container" style={{ paddingTop: 40 }}><div className="skeleton" style={{ height: 300 }} /></div>;

  const { stats, alerts } = data;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <h1 style={{ fontSize: '1.8rem' }}>Admin dashboard</h1>

      {alerts.length > 0 && (
        <div className="card" style={{ padding: 18, margin: '20px 0', borderLeft: '4px solid var(--clay)' }}>
          <strong>Data quality alerts</strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
            {alerts.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 20 }}>
        <StatCard label="Total colleges" value={stats.colleges.total} />
        <StatCard label="Verified" value={stats.colleges.verified || 0} />
        <StatCard label="Needs verification" value={stats.colleges.needs_verification || 0} />
        <StatCard label="Outdated" value={stats.colleges.outdated || 0} />
        <StatCard label="Pending reviews" value={stats.reviews.pending || 0} link="/admin/reviews" />
        <StatCard label="Pending claims" value={stats.pendingClaims} />
        <StatCard label="Pending update requests" value={stats.pendingUpdateRequests} link="/admin/update-requests" />
        <StatCard label="Students" value={stats.users.students || 0} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
        <Link to="/admin/colleges" className="btn btn-primary btn-sm">Manage colleges</Link>
        <Link to="/admin/reviews" className="btn btn-ghost btn-sm">Moderate reviews</Link>
        <Link to="/admin/update-requests" className="btn btn-ghost btn-sm">Review update requests</Link>
        <Link to="/admin/audit-logs" className="btn btn-ghost btn-sm">Audit logs</Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, link }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <span className="text-muted" style={{ fontSize: '0.8rem' }}>{label}</span>
      <h2 style={{ margin: '4px 0 8px' }}>{value}</h2>
      {link && <Link to={link} style={{ fontSize: '0.85rem' }}>View →</Link>}
    </div>
  );
}
