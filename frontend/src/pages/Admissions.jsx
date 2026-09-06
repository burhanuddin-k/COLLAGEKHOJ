import React, { useEffect, useState } from 'react';
import { admissionApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext.jsx';
import StatusPill from '../components/StatusPill.jsx';

export default function Admissions() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(true);
  const [tracked, setTracked] = useState({});

  useEffect(() => {
    setLoading(true);
    admissionApi.list({ status: status || undefined, state: state || undefined })
      .then(({ data }) => setRows(data.data))
      .finally(() => setLoading(false));
  }, [status, state]);

  async function handleTrack(admissionId) {
    if (!user) return;
    await admissionApi.trackDeadline(admissionId, new Date().toISOString());
    setTracked((t) => ({ ...t, [admissionId]: true }));
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <h1 style={{ fontSize: '1.8rem' }}>Admission deadlines</h1>
      <p className="text-muted">Statuses are computed live from published dates — never manually set.</p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '16px 0 24px' }}>
        <select className="input" style={{ width: 200 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="CLOSING_SOON">Closing soon</option>
          <option value="CLOSED">Closed</option>
        </select>
        <input className="input" style={{ width: 200 }} placeholder="Filter by state" value={state} onChange={(e) => setState(e.target.value)} />
      </div>

      {loading && <div className="skeleton" style={{ height: 300 }} />}

      {!loading && rows.length === 0 && <div className="empty-state">No admission records match this filter yet.</div>}

      {!loading && rows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((r) => (
            <div key={r.id} className="card" style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <strong>{r.college_name}</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>
                  {r.course_name} · {r.state} · Closes {r.application_end_date || 'TBD'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <StatusPill status={r.status} />
                {r.official_application_url && (
                  <a href={r.official_application_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Apply</a>
                )}
                {user?.role === 'student' && (
                  <button type="button" className="btn btn-primary btn-sm" disabled={!!tracked[r.id]} onClick={() => handleTrack(r.id)}>
                    {tracked[r.id] ? 'Reminder set' : 'Remind me'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
